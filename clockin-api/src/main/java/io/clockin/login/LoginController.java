package io.clockin.login;

import io.clockin.security.JwtService;
import io.clockin.usuario.Usuario;
import io.clockin.usuario.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/login")
public class LoginController {

    private final UsuarioRepository usuarioRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public LoginController(UsuarioRepository usuarioRepo, PasswordEncoder encoder, JwtService jwt) {
        this.usuarioRepo = usuarioRepo;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @PostMapping("/logar")
    public ResponseEntity<LoginResponse> logar(@Valid @RequestBody LoginRequest req) {
        Usuario usuario = usuarioRepo.findByLoginIgnoreCase(req.getNome()).orElse(null);
        if (usuario == null || !encoder.matches(req.getSenha(), usuario.getSenha())) {
            return ResponseEntity.status(401).build();
        }
        String token = jwt.gerarToken(usuario.getId(), usuario.getLogin(), Boolean.TRUE.equals(usuario.getAdmin()));
        return ResponseEntity.ok(new LoginResponse(token, usuario.getId(), usuario.getLogin(), usuario.getAdmin()));
    }
}
