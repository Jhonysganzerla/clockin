package io.clockin.login;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank
    private String nome;

    @NotBlank
    private String senha;

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
}
