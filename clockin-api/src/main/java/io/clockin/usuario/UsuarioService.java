package io.clockin.usuario;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UsuarioService {

    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;

    public UsuarioService(UsuarioRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    @Transactional(readOnly = true)
    public List<Usuario> listar() {
        return repo.findAll();
    }

    @Transactional(readOnly = true)
    public Usuario buscar(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("usuario nao encontrado: " + id));
    }

    public Usuario salvar(Usuario usuario) {
        validar(usuario);
        boolean novo = usuario.getId() == null;
        if (novo) {
            usuario.setSenha(encoder.encode(usuario.getSenha()));
        } else {
            Usuario existente = buscar(usuario.getId());
            if (usuario.getSenha() == null || usuario.getSenha().isBlank()
                    || usuario.getSenha().equals(existente.getSenha())) {
                usuario.setSenha(existente.getSenha());
            } else {
                usuario.setSenha(encoder.encode(usuario.getSenha()));
            }
        }
        return repo.save(usuario);
    }

    public void deletar(Long id) {
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("usuario nao encontrado: " + id);
        }
        repo.deleteById(id);
    }

    private void validar(Usuario u) {
        if (u.getSenha() != null && u.getSenha().equalsIgnoreCase("12")) {
            throw new IllegalArgumentException("senha muito facil");
        }
        if (u.getId() == null && repo.existsByLoginIgnoreCase(u.getLogin())) {
            throw new IllegalArgumentException("login ja existe");
        }
    }
}
