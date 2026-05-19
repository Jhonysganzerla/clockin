package io.clockin.ponto;

import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import io.clockin.ponto.dto.FilterPontoDTO;
import io.clockin.ponto.dto.PontoConsultaDTO;
import io.clockin.ponto.dto.PontoDiaDTO;
import io.clockin.ponto.dto.PontoDiaDTO.BatidaDTO;
import io.clockin.usuario.Usuario;
import io.clockin.usuario.UsuarioService;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class PontoPdfService {

    private static final DateTimeFormatter DATA_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter HORA_FMT = DateTimeFormatter.ofPattern("HH:mm:ss");
    private static final DateTimeFormatter DATA_HORA_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    private final PontoService pontoService;
    private final UsuarioService usuarioService;

    public PontoPdfService(PontoService pontoService, UsuarioService usuarioService) {
        this.pontoService = pontoService;
        this.usuarioService = usuarioService;
    }

    public byte[] gerar(FilterPontoDTO filter) throws Exception {
        PontoConsultaDTO consulta = pontoService.consultarAgrupado(filter);
        Usuario usuario = usuarioService.buscar(filter.getUsuario().getId());

        int maxBatidas = consulta.getPontosAgrupados().stream()
                .mapToInt(d -> d.getPontos().size())
                .max().orElse(0);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PdfWriter writer = new PdfWriter(out);
             PdfDocument pdf = new PdfDocument(writer);
             Document document = new Document(pdf)) {

            document.setMargins(20, 20, 20, 20);
            document.setFont(PdfFontFactory.createFont()).setFontSize(9);

            document.add(new Paragraph("Data: " + LocalDateTime.now().format(DATA_HORA_FMT))
                    .setFontSize(9)
                    .setTextAlignment(TextAlignment.RIGHT));
            document.add(new Paragraph("Colaborador: " + (usuario.getNome() != null ? usuario.getNome() : usuario.getLogin()))
                    .setFontSize(12));
            document.add(new Paragraph("Horario Ponto")
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(28));

            Table table = new Table(UnitValue.createPercentArray(maxBatidas + 4))
                    .useAllAvailableWidth();

            table.addHeaderCell(center("Data"));
            for (int i = 0; i < maxBatidas; i++) {
                table.addHeaderCell(center(i % 2 == 0 ? "Entrada" : "Saida"));
            }
            table.addHeaderCell(center("Extra"));
            table.addHeaderCell(center("Falta"));
            table.addHeaderCell(center("Hr. Trab"));

            for (PontoDiaDTO dia : consulta.getPontosAgrupados()) {
                String prefixo = dia.getAuxDia() == null || " ".equals(dia.getAuxDia()) ? "" : dia.getAuxDia() + " ";
                table.addCell(center(prefixo + dia.getDia().format(DATA_FMT)));
                for (BatidaDTO b : dia.getPontos()) {
                    table.addCell(center(b.getHora() == null ? " " : b.getHora().format(HORA_FMT)));
                }
                table.addCell(center(dia.getSextra()));
                table.addCell(center(dia.getSfalta()));
                table.addCell(center(dia.getShrtrab()));
            }

            Cell vazio = new Cell(1, maxBatidas + 1).add(new Paragraph(" "));
            table.addFooterCell(vazio);
            table.addFooterCell(center(consulta.getSconsultextra()));
            table.addFooterCell(center(consulta.getSconsultfalta()));
            table.addFooterCell(center(consulta.getSconsultotal()));

            String resumo = "Mes:  " + (consulta.getTotalMes() > 0 ? "Faltam" : "Sobram") + " ";
            table.addFooterCell(new Cell(1, maxBatidas + 3)
                    .add(new Paragraph(resumo))
                    .setTextAlignment(TextAlignment.RIGHT));
            table.addFooterCell(center(consulta.getStotalMes() + "h"));

            document.add(table);
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("____________________________________"));
            document.add(new Paragraph("Assinatura do contribuinte").setItalic());
        }
        return out.toByteArray();
    }

    private Cell center(String text) {
        return new Cell().add(new Paragraph(text)).setTextAlignment(TextAlignment.CENTER);
    }
}
