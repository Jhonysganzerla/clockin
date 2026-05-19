package io.clockin.feriado;

import io.clockin.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Entity
@Table(name = "cadferiado")
public class Feriado extends BaseEntity {

    @NotNull
    @Column(name = "dataf", nullable = false)
    private LocalDate dataf;

    @NotBlank
    @Size(max = 70)
    @Column(name = "descricao", nullable = false, length = 70)
    private String descricao;

    public LocalDate getDataf() { return dataf; }
    public void setDataf(LocalDate dataf) { this.dataf = dataf; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
}
