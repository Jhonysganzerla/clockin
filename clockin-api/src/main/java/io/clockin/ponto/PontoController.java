package io.clockin.ponto;

import io.clockin.ponto.dto.FilterPontoDTO;
import io.clockin.ponto.dto.PontoConsultaDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cadponto")
public class PontoController {

    private final PontoService service;
    private final PontoPdfService pdfService;

    public PontoController(PontoService service, PontoPdfService pdfService) {
        this.service = service;
        this.pdfService = pdfService;
    }

    @PostMapping("/list")
    public PontoConsultaDTO listar(@RequestBody FilterPontoDTO filter) {
        return service.consultarAgrupado(filter);
    }

    @PostMapping(value = "/imprimir", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> imprimir(@RequestBody FilterPontoDTO filter) throws Exception {
        byte[] pdf = pdfService.gerar(filter);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=ponto.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/findOne/{id}")
    public Ponto findOne(@PathVariable Long id) {
        return service.buscar(id);
    }

    @GetMapping("/listconsulta")
    public List<Ponto> listarConsulta() {
        return service.listarTodos();
    }

    @PostMapping("/save")
    public Ponto save(@Valid @RequestBody Ponto ponto) {
        return service.salvar(ponto);
    }

    @GetMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.ok().build();
    }
}
