package com.eduflex.certificateservice;

import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
class PdfService {
    public byte[] generatePdfCertificate(String studentName, String courseTitle) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, outputStream);

            document.open();
            document.add(new Paragraph("CERTIFICAT DE REUSSITE"));
            document.add(new Paragraph("Le présent certificat est décerné à : " + studentName));
            document.add(new Paragraph("Pour avoir complété avec succès la formation : " + courseTitle));
            document.close();
            
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error during PDF compilation", e);
        }
    }
}
