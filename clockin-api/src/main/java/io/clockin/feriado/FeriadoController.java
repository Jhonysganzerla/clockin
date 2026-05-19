package io.clockin.feriado;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cadferiado")
public class FeriadoController {

    private final FeriadoService service;

    public FeriadoController(FeriadoService service) {
        this.service = service;
    }

    @GetMapping("/list")
    public List<Feriado> listar() {
        return service.listar();
    }

    @GetMapping("/findOne/{id}")
    public Feriado findOne(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PostMapping("/save")
    @PreAuthorize("hasRole('ADMIN')")
    public Feriado save(@Valid @RequestBody Feriado feriado) {
        return service.salvar(feriado);
    }

    @GetMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.ok().build();
    }
}
