import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { existsSync } from 'fs';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailSchedulerService } from './email-scheduler.service';
import { TemplatePathUtil } from './utils/template-path.util';

@Module({
  imports: [
    PrismaModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => {
        // Usar la utilidad para obtener la ruta correcta de las plantillas
        const templatesDir = TemplatePathUtil.getTemplatesDirectory();
        
        // Listar plantillas disponibles para debugging
        const availableTemplates = TemplatePathUtil.getAvailableTemplates();
        console.log(`[EmailModule] Plantillas disponibles:`, availableTemplates);

        // Configuración de transporte
        const emailHost = config.get('EMAIL_HOST');
        const emailUser = config.get('EMAIL_USER');
        
        let transportConfig: any;
        
        if (!emailHost || !emailUser) {
          // Configuración de fallback para testing con Ethereal
          console.log('[EmailModule] Usando configuración de testing (Ethereal)');
          console.log('[EmailModule] IMPORTANTE: Configura las variables EMAIL_HOST y EMAIL_USER para producción');
          
          const nodemailer = require('nodemailer');
          const testAccount = await nodemailer.createTestAccount();
          
          transportConfig = {
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass,
            },
          };
          
          console.log(`[EmailModule] Cuenta de testing creada: ${testAccount.user}`);
          console.log(`[EmailModule] Ver emails en: https://ethereal.email/messages`);
        } else {
          // Configuración normal
          transportConfig = {
            host: emailHost,
            port: config.get('EMAIL_PORT'),
            secure: config.get('EMAIL_SECURE') === 'true',
            auth: {
              user: emailUser,
              pass: config.get('EMAIL_PASSWORD'),
            },
            // Configuración adicional para manejar certificados SSL
            tls: {
              rejectUnauthorized: false, // Para desarrollo/testing
              ciphers: 'SSLv3',
            },
            // Configuración específica para Gmail
            requireTLS: true,
            connectionTimeout: 60000,
            greetingTimeout: 30000,
            socketTimeout: 60000,
          };
        }

        return {
          transport: transportConfig,
          defaults: {
            from: `"${config.get('EMAIL_FROM_NAME') || 'EnRuta Sistema'}" <${config.get('EMAIL_FROM_ADDRESS') || emailUser || 'test@ethereal.email'}>`,
          },
          template: {
            dir: templatesDir,
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailSchedulerService],
  exports: [EmailService, EmailSchedulerService],
})
export class EmailModule {} 