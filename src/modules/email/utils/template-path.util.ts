import { join } from 'path';
import { existsSync } from 'fs';

export class TemplatePathUtil {
  /**
   * Obtiene la ruta correcta del directorio de plantillas
   * Funciona tanto en desarrollo como en producción
   */
  static getTemplatesDirectory(): string {
    const isProduction = process.env.NODE_ENV === 'production';
    
    const possiblePaths = isProduction ? [
      // En producción, priorizar rutas compiladas
      join(process.cwd(), 'dist', 'modules', 'email', 'templates'),
      join(__dirname, '..', 'templates'),
      join(process.cwd(), 'dist', 'src', 'modules', 'email', 'templates'),
      // Fallback a desarrollo solo si no encuentra en dist
      join(process.cwd(), 'src', 'modules', 'email', 'templates'),
      join(process.cwd(), 'templates'),
    ] : [
      // En desarrollo, priorizar ruta de código fuente
      join(process.cwd(), 'src', 'modules', 'email', 'templates'),
      join(process.cwd(), 'dist', 'modules', 'email', 'templates'),
      join(__dirname, '..', 'templates'),
      join(process.cwd(), 'dist', 'src', 'modules', 'email', 'templates'),
      join(process.cwd(), 'templates'),
    ];

    for (const path of possiblePaths) {
      if (existsSync(path)) {
        console.log(`[TemplatePathUtil] Usando directorio de plantillas: ${path}`);
        return path;
      }
    }

    // Si ninguna ruta existe, usar la primera como fallback y loggear el error
    const fallbackPath = possiblePaths[0];
    console.error(`[TemplatePathUtil] No se encontró directorio de plantillas válido. Usando fallback: ${fallbackPath}`);
    console.error(`[TemplatePathUtil] Rutas verificadas:`, possiblePaths);
    
    return fallbackPath;
  }

  /**
   * Verifica si una plantilla específica existe
   */
  static templateExists(templateName: string): boolean {
    const templatesDir = this.getTemplatesDirectory();
    const templatePath = join(templatesDir, `${templateName}.hbs`);
    return existsSync(templatePath);
  }

  /**
   * Lista todas las plantillas disponibles
   */
  static getAvailableTemplates(): string[] {
    const templatesDir = this.getTemplatesDirectory();
    
    if (!existsSync(templatesDir)) {
      return [];
    }

    try {
      const fs = require('fs');
      return fs.readdirSync(templatesDir)
        .filter((file: string) => file.endsWith('.hbs'))
        .map((file: string) => file.replace('.hbs', ''));
    } catch (error) {
      console.error('[TemplatePathUtil] Error listando plantillas:', error);
      return [];
    }
  }
} 