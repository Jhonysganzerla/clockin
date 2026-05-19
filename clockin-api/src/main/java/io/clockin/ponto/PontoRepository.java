package io.clockin.ponto;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PontoRepository extends JpaRepository<Ponto, Long> {

    @Query("""
           select p from Ponto p
           where p.usuario.id = :usuarioId
             and p.data between :dataIni and :dataFin
           order by p.data asc, p.hora asc
           """)
    List<Ponto> buscarPorUsuarioNoPeriodo(@Param("usuarioId") Long usuarioId,
                                          @Param("dataIni") LocalDate dataIni,
                                          @Param("dataFin") LocalDate dataFin);

    @Query("""
           select p from Ponto p
           join fetch p.usuario u
           order by p.data asc, p.hora asc
           """)
    List<Ponto> findAllByOrderByDataAsc();
}
