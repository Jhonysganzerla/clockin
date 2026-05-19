package io.clockin.feriado;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class FeriadoService {

    private final FeriadoRepository repo;

    public FeriadoService(FeriadoRepository repo) {
        this.repo = repo;
    }

    @Transactional(readOnly = true)
    public List<Feriado> listar() {
        return repo.findAll();
    }

    @Transactional(readOnly = true)
    public List<Feriado> listarNoPeriodo(LocalDate ini, LocalDate fin) {
        return repo.findByDatafBetweenOrderByDatafAsc(ini, fin);
    }

    @Transactional(readOnly = true)
    public Feriado buscar(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("feriado nao encontrado: " + id));
    }

    public Feriado salvar(Feriado feriado) {
        return repo.save(feriado);
    }

    public void deletar(Long id) {
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("feriado nao encontrado: " + id);
        }
        repo.deleteById(id);
    }
}
