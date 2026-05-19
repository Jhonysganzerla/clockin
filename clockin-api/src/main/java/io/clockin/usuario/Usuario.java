package io.clockin.usuario;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.clockin.common.BaseEntity;
import io.clockin.common.BooleanSnConverter;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "cadusuario")
public class Usuario extends BaseEntity {

    @NotBlank
    @Size(max = 30)
    @Column(name = "login", nullable = false, length = 30, unique = true)
    private String login;

    @Size(max = 50)
    @Column(name = "nome", length = 50)
    private String nome;

    @NotBlank
    @Size(max = 100)
    @Column(name = "senha", nullable = false, length = 100)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    /** Horas mensais no formato HHMM (ex: 220 = 220h, ou 8030 = 80h30min — herdado do legado). */
    @NotNull
    @Column(name = "horames", nullable = false)
    private Integer horames;

    /** Horas diárias no formato HHMM (ex: 800 = 8h). */
    @NotNull
    @Column(name = "horadia", nullable = false)
    private Integer horadia;

    @NotNull
    @Convert(converter = BooleanSnConverter.class)
    @Column(name = "admin", length = 1, nullable = false)
    private Boolean admin = Boolean.FALSE;

    public String getLogin() { return login; }
    public void setLogin(String login) { this.login = login == null ? null : login.toLowerCase(); }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public Integer getHorames() { return horames; }
    public void setHorames(Integer horames) { this.horames = horames; }

    public Integer getHoradia() { return horadia; }
    public void setHoradia(Integer horadia) { this.horadia = horadia; }

    public Boolean getAdmin() { return admin; }
    public void setAdmin(Boolean admin) { this.admin = admin; }
}
