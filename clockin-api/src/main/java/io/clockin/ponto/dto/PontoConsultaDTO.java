package io.clockin.ponto.dto;

import io.clockin.common.ConvertUtils;

import java.util.ArrayList;
import java.util.List;

public class PontoConsultaDTO {

    private List<PontoDiaDTO> pontosAgrupados = new ArrayList<>();

    private long consultotal;
    private long consultextra;
    private long consultfalta;
    private long totalMes;

    public List<PontoDiaDTO> getPontosAgrupados() { return pontosAgrupados; }
    public void setPontosAgrupados(List<PontoDiaDTO> v) { this.pontosAgrupados = v; }

    public long getConsultotal() { return consultotal; }
    public void setConsultotal(long v) { this.consultotal = v; }

    public long getConsultextra() { return consultextra; }
    public void setConsultextra(long v) { this.consultextra = v; }

    public long getConsultfalta() { return consultfalta; }
    public void setConsultfalta(long v) { this.consultfalta = v; }

    public long getTotalMes() { return totalMes; }
    public void setTotalMes(long v) { this.totalMes = v; }

    public String getSconsultotal()  { return ConvertUtils.msToTime(consultotal); }
    public String getSconsultextra() { return ConvertUtils.msToTime(consultextra); }
    public String getSconsultfalta() { return ConvertUtils.msToTime(consultfalta); }
    public String getStotalMes()     { return ConvertUtils.msToTime(Math.abs(totalMes)); }
}
