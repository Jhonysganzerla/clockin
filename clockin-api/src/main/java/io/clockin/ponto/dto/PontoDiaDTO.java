package io.clockin.ponto.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.clockin.common.ConvertUtils;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/** Representa um dia agrupado, com suas batidas e totais calculados. */
public class PontoDiaDTO {

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dia;

    /** " " = normal, "*" = incompleto, "S" = sábado, "D" = domingo, "F" = feriado. */
    private String auxDia = " ";

    private List<BatidaDTO> pontos = new ArrayList<>();

    private long hrtrab;
    private long extra;
    private long falta;

    public LocalDate getDia() { return dia; }
    public void setDia(LocalDate dia) { this.dia = dia; }

    public String getAuxDia() { return auxDia; }
    public void setAuxDia(String auxDia) { this.auxDia = auxDia; }

    public List<BatidaDTO> getPontos() { return pontos; }
    public void setPontos(List<BatidaDTO> pontos) { this.pontos = pontos; }

    public long getHrtrab() { return hrtrab; }
    public void setHrtrab(long hrtrab) { this.hrtrab = hrtrab; }

    public long getExtra() { return extra; }
    public void setExtra(long extra) { this.extra = extra; }

    public long getFalta() { return falta; }
    public void setFalta(long falta) { this.falta = falta; }

    public String getShrtrab() { return "*".equals(auxDia) ? "-" : ConvertUtils.msToTime(hrtrab); }
    public String getSextra()  { return "*".equals(auxDia) ? "-" : ConvertUtils.msToTime(extra); }
    public String getSfalta()  { return "*".equals(auxDia) ? "-" : ConvertUtils.msToTime(falta); }

    public static class BatidaDTO {
        private Long id;
        @JsonFormat(pattern = "HH:mm:ss")
        private LocalTime hora;

        public BatidaDTO() {}
        public BatidaDTO(Long id, LocalTime hora) { this.id = id; this.hora = hora; }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public LocalTime getHora() { return hora; }
        public void setHora(LocalTime hora) { this.hora = hora; }
    }
}
