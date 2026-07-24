package com.eduflex.mediaservice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

/* Abstraction de stockage : le controller ne connait que cette interface.
   Aujourd'hui = disque local ; demain = cloud (S3), en ajoutant une implementation
   annotee @ConditionalOnProperty(name="media.storage", havingValue="s3") et en
   passant media.storage=s3 dans la config. Rien d'autre a changer cote controller. */
public interface StorageProvider {
    /** Stocke le fichier sous le nom (clef) fourni. */
    void store(MultipartFile file, String name) throws IOException;
    /** Charge une ressource par nom (clef). */
    Resource load(String name) throws IOException;
}

/* Implementation locale (defaut). Selectionnee sauf si media.storage=s3. */
@Component
@ConditionalOnProperty(name = "media.storage", havingValue = "local", matchIfMissing = true)
class LocalStorageProvider implements StorageProvider {

    private final Path root;

    public LocalStorageProvider(@Value("${file.upload-dir:./uploads}") String uploadDir) {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.root);
        } catch (Exception ex) {
            throw new RuntimeException("Impossible de creer le dossier de stockage: " + this.root, ex);
        }
    }

    @Override
    public void store(MultipartFile file, String name) throws IOException {
        Path target = this.root.resolve(name).normalize();
        if (!target.getParent().equals(this.root)) {
            throw new IOException("Chemin de fichier invalide: " + name);
        }
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
    }

    @Override
    public Resource load(String name) throws IOException {
        Path path = this.root.resolve(name).normalize();
        if (!path.getParent().equals(this.root)) {
            throw new IOException("Chemin de fichier invalide: " + name);
        }
        return new UrlResource(path.toUri());
    }
}
