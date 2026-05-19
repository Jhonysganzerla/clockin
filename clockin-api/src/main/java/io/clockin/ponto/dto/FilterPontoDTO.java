package io.clockin.ponto.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;

public class FilterPontoDTO {

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataIni;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dataFin;

    private UsuarioRef usuario;

    public LocalDate getDataIni() { return dataIni; }
    public void setDataIni(LocalDate dataIni) { this.dataIni = dataIni; }

    public LocalDate getDataFin() { return dataFin; }
    public void setDataFin(LocalDate dataFin) { this.dataFin = dataFin; }

    public UsuarioRef getUsuario() { return usuario; }
    public void setUsuario(UsuarioRef usuario) { this.usuario = usuario; }

    public static class UsuarioRef {
        private Long id;
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
    }
}
