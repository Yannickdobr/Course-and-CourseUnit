import os

def generate_tree_with_content(startpath):
    output_file = "mon_projet.txt"
    # --- CONFIGURATION : Ajoutez ici les dossiers à ignorer ---
    folders_to_ignore = {'node_modules', 'venv', '.git', '__pycache__', 'target', 'dist'}
    # ---------------------------------------------------------
    
    with open(output_file, "w", encoding="utf-8") as f:
        for root, dirs, files in os.walk(startpath):
            # Filtrage des dossiers :
            # On garde seulement les dossiers qui ne sont pas dans notre liste d'exclusion
            # ET qui ne commencent pas par un point.
            dirs[:] = [d for d in dirs if d not in folders_to_ignore and not d.startswith('.')]
            
            level = root.replace(startpath, '').count(os.sep)
            indent = ' ' * 4 * level
            folder_name = os.path.basename(root) or startpath
            f.write(f'{indent}📂 Folder: {folder_name}/\n')
            
            sub_indent = ' ' * 4 * (level + 1)
            
            for file in files:
                # On ignore aussi les fichiers cachés et le script lui-même
                if not file.startswith('.') and file != output_file and file != "tree_content.py":
                    file_path = os.path.join(root, file)
                    f.write(f'{sub_indent}📄 Fichier: {file}\n')
                    f.write(f'{sub_indent}{"-" * 20} CONTENU {"-" * 20}\n')
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as content:
                            f.write(content.read())
                    except Exception:
                        f.write(f"{sub_indent}[Fichier binaire ou illisible]")
                    
                    f.write(f'\n{sub_indent}{"-" * 49}\n\n')

if __name__ == "__main__":
    generate_tree_with_content('.')
    print("Analyse terminée ! Les dossiers inutiles ont été ignorés.")
