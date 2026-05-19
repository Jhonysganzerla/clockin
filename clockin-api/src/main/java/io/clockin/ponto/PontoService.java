package io.clockin.ponto;

import io.clockin.feriado.Feriado;
import io.clockin.feriado.FeriadoService;
import io.clockin.ponto.dto.FilterPontoDTO;
import io.clockin.ponto.dto.PontoConsultaDTO;
import io.clockin.ponto.dto.PontoDiaDTO;
import io.clockin.ponto.dto.PontoDiaDTO.BatidaDTO;
import io.clockin.usuario.Usuario;
import io.clockin.usuario.UsuarioService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
@Transactional
public class PontoService {

    private static final long QUATRO_HORAS_MS = Duration.ofHours(4).toMillis();
    private static final int LIMITE_DIAS = 31;

    private final PontoRepository repo;
    private final UsuarioService usuarioService;
    private final FeriadoService feriadoService;

    public PontoService(PontoRepository repo,
                        UsuarioService usuarioService,
                        FeriadoService feriadoService) {
        this.repo = repo;
        this.usuarioService = usuarioService;
        this.feriadoService = feriadoService;
    }

    @Transactional(readOnly = true)
    public Ponto buscar(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ponto nao encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<Ponto> listarTodos() {
        return repo.findAllByOrderByDataAsc();
    }

    public Ponto salvar(Ponto ponto) {
        if (ponto.getUsuario() == null || ponto.getUsuario().getId() == null) {
            throw new IllegalArgumentException("usuario obrigatorio");
        }
        usuarioService.buscar(ponto.getUsuario().getId());
        return repo.save(ponto);
    }

    public void deletar(Long id) {
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("ponto nao encontrado: " + id);
        }
        repo.deleteById(id);
    }

    /**
     * Agrupa as batidas por dia, marca dias especiais (sabado/domingo/feriado/incompleto)
     * e calcula horas trabalhadas, faltas e extras conforme o regime do usuario.
     */
    @Transactional(readOnly = true)
    public PontoConsultaDTO consultarAgrupado(FilterPontoDTO filter) {
        validarFiltro(filter);

        Usuario usuario = usuarioService.buscar(filter.getUsuario().getId());
        List<Ponto> batidas = repo.buscarPorUsuarioNoPeriodo(
                usuario.getId(), filter.getDataIni(), filter.getDataFin());

        Map<LocalDate, PontoDiaDTO> porDia = new TreeMap<>();

        // Preenche todos os dias do periodo (mesmo sem batida)
        for (LocalDate d = filter.getDataIni(); !d.isAfter(filter.getDataFin()); d = d.plusDays(1)) {
            PontoDiaDTO dia = new PontoDiaDTO();
            dia.setDia(d);
            porDia.put(d, dia);
        }

        // Distribui as batidas
        for (Ponto p : batidas) {
            porDia.get(p.getData()).getPontos().add(new BatidaDTO(p.getId(), p.getHora()));
        }

        // Iguala o numero de colunas (par) para exibicao tabular
        int max = porDia.values().stream()
                .mapToInt(d -> d.getPontos().size())
                .max().orElse(0);
        if (max % 2 == 1) max++;
        for (PontoDiaDTO dia : porDia.values()) {
            while (dia.getPontos().size() < max) {
                dia.getPontos().add(new BatidaDTO(null, null));
            }
        }

        // Marca dias especiais
        List<Feriado> feriados = feriadoService.listarNoPeriodo(
                filter.getDataIni(), filter.getDataFin());
        Set<LocalDate> datasFeriado = new HashSet<>();
        for (Feriado f : feriados) datasFeriado.add(f.getDataf());

        for (PontoDiaDTO dia : porDia.values()) {
            if (!diaCompleto(dia)) {
                dia.setAuxDia("*");
                continue;
            }
            if (datasFeriado.contains(dia.getDia())) {
                dia.setAuxDia("F");
            } else if (dia.getDia().getDayOfWeek() == DayOfWeek.SATURDAY) {
                dia.setAuxDia("S");
            } else if (dia.getDia().getDayOfWeek() == DayOfWeek.SUNDAY) {
                dia.setAuxDia("D");
            }
        }

        PontoConsultaDTO ret = new PontoConsultaDTO();
        ret.setPontosAgrupados(new ArrayList<>(porDia.values()));
        calcular(ret, usuario);
        return ret;
    }

    private void validarFiltro(FilterPontoDTO filter) {
        if (filter == null || filter.getDataIni() == null
                || filter.getDataFin() == null
                || filter.getUsuario() == null
                || filter.getUsuario().getId() == null) {
            throw new IllegalArgumentException("filtro invalido");
        }
        long dias = filter.getDataIni().until(filter.getDataFin()).getDays();
        if (dias > LIMITE_DIAS) {
            throw new IllegalArgumentException("diferenca-dias-maior-que-permitido");
        }
    }

    /** Um dia esta "completo" quando tem pares de entrada/saida sem buracos. */
    private boolean diaCompleto(PontoDiaDTO dia) {
        int reais = 0;
        for (BatidaDTO b : dia.getPontos()) {
            if (b != null && b.getHora() != null) reais++;
        }
        if (reais == 0) return false;
        return reais % 2 == 0;
    }

    private void calcular(PontoConsultaDTO ret, Usuario usuario) {
        long totalFalta = 0, totalExtra = 0, totalTotal = 0;

        long horadiaMs = hhmmParaMs(usuario.getHoradia());
        long horamesMs = hhmmParaMs(usuario.getHorames());

        for (PontoDiaDTO dia : ret.getPontosAgrupados()) {
            if ("*".equals(dia.getAuxDia())) continue;

            long trabalhado = somarTrabalhado(dia);
            long extra = 0, falta = 0;

            String tipo = dia.getAuxDia();
            boolean mensalistaSabado = usuario.getHorames() > 200 && "S".equals(tipo);
            boolean diaNaoUtil = "D".equals(tipo) || "F".equals(tipo) || "S".equals(tipo);

            if (mensalistaSabado) {
                // Sabado de mensalista vale 4h
                if (trabalhado > QUATRO_HORAS_MS) {
                    extra = trabalhado - QUATRO_HORAS_MS;
                } else {
                    falta = QUATRO_HORAS_MS - trabalhado;
                }
            } else if (diaNaoUtil) {
                // Sabado (nao-mensalista), domingo e feriado: tudo conta como extra
                extra = trabalhado;
                if ("F".equals(tipo)) {
                    DayOfWeek dow = dia.getDia().getDayOfWeek();
                    boolean feriadoEmDiaUtil = dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY;
                    if (feriadoEmDiaUtil) {
                        // Feriado em dia util: trabalha como dia normal + extra; computa a jornada esperada
                        trabalhado = horadiaMs;
                    }
                }
            } else {
                // Dia util normal
                if (trabalhado > horadiaMs) {
                    extra = trabalhado - horadiaMs;
                } else {
                    falta = horadiaMs - trabalhado;
                }
            }

            dia.setHrtrab(trabalhado);
            dia.setExtra(extra);
            dia.setFalta(falta);

            totalTotal += trabalhado;
            totalExtra += extra;
            totalFalta += falta;
        }

        ret.setConsultotal(totalTotal);
        ret.setConsultextra(totalExtra);
        ret.setConsultfalta(totalFalta);
        ret.setTotalMes(horamesMs - totalTotal + totalFalta);
    }

    private long somarTrabalhado(PontoDiaDTO dia) {
        long ms = 0;
        List<BatidaDTO> pontos = dia.getPontos();
        for (int i = 0; i + 1 < pontos.size(); i += 2) {
            LocalTime entrada = pontos.get(i).getHora();
            LocalTime saida = pontos.get(i + 1).getHora();
            if (entrada != null && saida != null) {
                ms += Duration.between(entrada, saida).toMillis();
            }
        }
        return ms;
    }

    /** Converte HHMM (ex: 800 = 8h00, 830 = 8h30) em milissegundos. */
    static long hhmmParaMs(int hhmm) {
        int horas = hhmm / 100;
        int minutos = hhmm % 100;
        return (horas * 3600L + minutos * 60L) * 1000L;
    }
}
