package io.clockin.feriado;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface FeriadoRepository extends JpaRepository<Feriado, Long> {

    List<Feriado> findByDatafBetweenOrderByDatafAsc(LocalDate inicio, LocalDate fim);
}
