package io.clockin.usuario;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cadusuario")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @GetMapping("/list")
    public List<Usuario> listar() {
        return service.listar();
    }

    @GetMapping("/findOne/{id}")
    public Usuario findOne(@PathVariable Long id) {
        return service.buscar(id);
    }

    @PostMapping("/save")
    @PreAuthorize("hasRole('ADMIN')")
    public Usuario save(@Valid @RequestBody Usuario usuario) {
        return service.salvar(usuario);
    }

    @GetMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.ok().build();
    }
}
