package io.clockin.login;

public class LoginResponse {

    private String token;
    private Long id;
    private String nome;
    private Boolean admin;

    public LoginResponse() {}

    public LoginResponse(String token, Long id, String nome, Boolean admin) {
        this.token = token;
        this.id = id;
        this.nome = nome;
        this.admin = admin;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public Boolean getAdmin() { return admin; }
    public void setAdmin(Boolean admin) { this.admin = admin; }
}
