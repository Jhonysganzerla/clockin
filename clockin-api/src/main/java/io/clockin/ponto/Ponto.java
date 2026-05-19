package io.clockin.ponto;

import io.clockin.common.BaseEntity;
import io.clockin.usuario.Usuario;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "cadponto", indexes = @Index(name = "idx_cadponto_usuario_data", columnList = "usuario,data"))
public class Ponto extends BaseEntity {

    @NotNull
    @Column(name = "data", nullable = false)
    private LocalDate data;

    @NotNull
    @Column(name = "hora", nullable = false)
    private LocalTime hora;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario", nullable = false, foreignKey = @ForeignKey(name = "cadponto_cadusuario"))
    private Usuario usuario;

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }

    public LocalTime getHora() { return hora; }
    public void setHora(LocalTime hora) { this.hora = hora; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
}
