import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';
import { validate } from 'email-validator';
import EmailConfig from '../config/EmailConfig';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Variável global para as cores
const GLOBAL_COLORS = {
  primary: '#FEC05D',       // Dourado principal
  secondary: '#D99A36',     // Laranja queimado
  accent: '#FFD792',        // Laranja claro (acentos)
  success: '#B97A2D',       // Bronze para sucesso
  warning: '#FFF1D0',       // Creme para alertas
  error: '#A65F1A',         // Laranja escuro avermelhado para erro
  text: '#4A2C08',          // Marrom muito escuro para texto principal
  lightText: '#8C5B28',     // Marrom claro/dourado para texto secundário
  background: '#FFF9F1',    // Bege quase branco (fundo)
  white: '#FFFFFF',         // Branco puro
  dark: '#3A2409',          // Marrom escuro para destaques
  light: '#FFE1A8'          // Dourado muito claro para destaques
};


// Configurações de design moderno
const DESIGN_SYSTEM = {
  colors: GLOBAL_COLORS,
  fonts: {
    primary: 'Helvetica',
    bold: 'Helvetica-Bold',
    elegant: 'Times-Roman'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 4px 6px rgba(0,0,0,0.1)'
  }
};

class EmailService {
  private transporter: Transporter;
  private credenciais = {
    email: process.env.EMAIL || ''
  };

  constructor() {
    this.transporter = EmailConfig;
  }

  private getInlineLogoAttachment() {
    return {
      filename: 'logo.png',
      path: path.resolve(__dirname, '../../assets/img/logo.png'),
      cid: 'logo'
    };
  }

  private getEmailTemplate(header: string, content: string, includeLogo = true) {
    return `
      <div style="
        font-family: ${DESIGN_SYSTEM.fonts.primary}, Arial, sans-serif;
        max-width: 600px;
        margin: 0 auto;
        padding: ${DESIGN_SYSTEM.spacing.lg}px;
        background: ${DESIGN_SYSTEM.colors.white};
        border-radius: ${DESIGN_SYSTEM.radius.md}px;
        box-shadow: ${DESIGN_SYSTEM.shadows.md};
        color: ${DESIGN_SYSTEM.colors.text};
      ">
        ${includeLogo ? `
        <div style="text-align: center; margin-bottom: ${DESIGN_SYSTEM.spacing.lg}px;">
          <img src="cid:logo" alt="Logo" style="height: 60px;">
        </div>
        ` : ''}
        
        <h2 style="
          color: ${DESIGN_SYSTEM.colors.primary};
          margin-top: 0;
          font-family: ${DESIGN_SYSTEM.fonts.bold};
        ">
          ${header}
        </h2>
        
        <div style="
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: ${DESIGN_SYSTEM.spacing.lg}px;
        ">
          ${content}
        </div>
        
        <div style="
          border-top: 1px solid ${DESIGN_SYSTEM.colors.background};
          padding-top: ${DESIGN_SYSTEM.spacing.md}px;
          font-size: 14px;
          color: ${DESIGN_SYSTEM.colors.lightText};
        ">
          <p style="margin: 0;">
            Atenciosamente,<br>
            <strong style="color: ${DESIGN_SYSTEM.colors.primary};">Equipe Escola 30 De Setembro 2025  </strong>
          </p>
        </div>
      </div>
    `;
  }


  public async sendConfirmationCode(recipient: string, code: string): Promise<boolean> {
    try {
      const emailValid = await this.check_email(recipient);
      if (!emailValid.valid) return false;

      const content = `
        <p>Seu código de verificação é:</p>
        <div style="
          display: inline-block;
          padding: ${DESIGN_SYSTEM.spacing.md}px ${DESIGN_SYSTEM.spacing.lg}px;
          background: ${DESIGN_SYSTEM.colors.primary};
          color: ${DESIGN_SYSTEM.colors.white};
          border-radius: ${DESIGN_SYSTEM.radius.md}px;
          font-size: 24px;
          font-weight: bold;
          margin: ${DESIGN_SYSTEM.spacing.md}px 0;
          letter-spacing: 2px;
        ">
          ${code}
        </div>
        <p>Este código expira em 15 minutos. Por segurança, não compartilhe com ninguém.</p>
      `;

      const mailOptions: SendMailOptions = {
        from: this.credenciais.email,
        to: recipient,
        subject: "🔐 Seu Código de Verificação Escola 30 De Setembro 2025  ",
        html: this.getEmailTemplate("Confirme seu acesso", content),
        attachments: [this.getInlineLogoAttachment()]
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Confirmation code sent:', info.response);
      return true;
    } catch (error) {
      console.error('Error sending confirmation code:', error);
      return false;
    }
  }

  public async send_message(recipient: string, content: string): Promise<boolean> {
    try {
      const emailValid = await this.check_email(recipient);
      if (!emailValid.valid) return false;

      const mailOptions: SendMailOptions = {
        from: this.credenciais.email,
        to: recipient,
        subject: "✉️ Mensagem da Escola 30 De Setembro 2025  ",
        html: this.getEmailTemplate("Nova Mensagem", content),
        attachments: [this.getInlineLogoAttachment()]
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Message sent:', info.response);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  public async send_message_code(recipient: string, password: string): Promise<boolean> {
    try {
      const emailValid = await this.check_email(recipient);
      if (!emailValid.valid) return false;

      const content = `
        <p>Sua nova senha de acesso:</p>
        <div style="
          display: inline-block;
          padding: ${DESIGN_SYSTEM.spacing.md}px ${DESIGN_SYSTEM.spacing.lg}px;
          background: ${DESIGN_SYSTEM.colors.warning};
          color: ${DESIGN_SYSTEM.colors.text};
          border-radius: ${DESIGN_SYSTEM.radius.md}px;
          font-size: 20px;
          font-weight: bold;
          margin: ${DESIGN_SYSTEM.spacing.md}px 0;
          font-family: monospace;
        ">
          ${password}
        </div>
        <p>Por segurança, recomendamos que altere esta senha após o primeiro acesso.</p>
      `;

      const mailOptions: SendMailOptions = {
        from: this.credenciais.email,
        to: recipient,
        subject: "🔑 Nova Senha de Acesso",
        html: this.getEmailTemplate("Sua Nova Senha", content),
        attachments: [this.getInlineLogoAttachment()]
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Password sent:', info.response);
      return true;
    } catch (error) {
      console.error('Error sending password:', error);
      return false;
    }
  }

  public async check_email(email: string): Promise<{ valid: boolean, reason?: string }> {
    if (!validate(email)) {
      return { valid: false, reason: "Formato de e-mail inválido" };
    }
    return { valid: true };
  }
}

export default EmailService;