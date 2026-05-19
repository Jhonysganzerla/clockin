package io.clockin.common;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/** Persiste Boolean como 'S' / 'N' (compatível com base de dados antiga). */
@Converter
public class BooleanSnConverter implements AttributeConverter<Boolean, String> {

    @Override
    public String convertToDatabaseColumn(Boolean attribute) {
        return Boolean.TRUE.equals(attribute) ? "S" : "N";
    }

    @Override
    public Boolean convertToEntityAttribute(String dbData) {
        return "S".equalsIgnoreCase(dbData);
    }
}
