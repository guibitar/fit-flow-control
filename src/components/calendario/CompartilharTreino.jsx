import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Copy, MessageCircle, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function CompartilharTreino({ treino, cliente, open, onClose }) {
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [emailEnviado, setEmailEnviado] = useState(false);
  const [copiado, setCopiado] = useState(false);

  const formatarTreinoTexto = (treino) => {
    if (!treino || !treino.exercicios) return "";

    let texto = `🏋️ *${treino.titulo}*\n\n`;
    
    if (treino.descricao) {
      texto += `📋 ${treino.descricao}\n\n`;
    }

    texto += `⏱️ Duração estimada: ${treino.duracao_estimada} minutos\n`;
    texto += `💪 Tipo: ${treino.tipo}\n\n`;
    texto += `━━━━━━━━━━━━━━━━━━\n\n`;

    treino.exercicios.forEach((item, index) => {
      if (item.tipo_item === 'exercicio') {
        texto += `${index + 1}. *${item.nome}*\n`;
        texto += `   🎯 ${item.grupo_muscular}\n`;
        texto += `   📊 ${item.series} séries`;
        
        if (item.tipo_execucao === 'tempo') {
          texto += ` × ${item.tempo_execucao}s\n`;
        } else {
          texto += ` × ${item.repeticoes} reps\n`;
        }
        
        if (item.descanso) {
          texto += `   ⏸️ Descanso: ${item.descanso}\n`;
        }
        
        if (item.video_url) {
          texto += `   📹 Vídeo: ${item.video_url}\n`;
        }
        
        if (item.observacoes) {
          texto += `   💡 ${item.observacoes}\n`;
        }
        
        texto += `\n`;
      } else {
        const tipoLabels = {
          'bi-set': 'BI-SET',
          'tri-set': 'TRI-SET',
          'giga-set': 'GIGA-SET'
        };
        
        texto += `${index + 1}. *${tipoLabels[item.tipo_item]}* (${item.series} séries)\n`;
        texto += `   ⚡ Executar em sequência sem pausa\n`;
        
        item.exercicios_grupo?.forEach((ex, exIdx) => {
          texto += `   ${String.fromCharCode(97 + exIdx)}) ${ex.nome}\n`;
          if (ex.tipo_execucao === 'tempo') {
            texto += `      ${ex.tempo_execucao}s`;
          } else {
            texto += `      ${ex.repeticoes} reps`;
          }
          if (ex.video_url) {
            texto += ` - 📹 ${ex.video_url}`;
          }
          texto += `\n`;
        });
        
        if (item.descanso) {
          texto += `   ⏸️ Descanso após o grupo: ${item.descanso}\n`;
        }
        
        texto += `\n`;
      }
    });

    texto += `━━━━━━━━━━━━━━━━━━\n\n`;
    texto += `💪 Bom treino!\n`;
    texto += `📱 Em caso de dúvidas, entre em contato.`;

    return texto;
  };

  const formatarTreinoHTML = (treino) => {
    if (!treino || !treino.exercicios) return "";

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          h1 {
            color: #2563eb;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .info {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
          }
          .info p {
            margin: 5px 0;
          }
          .exercicio {
            background-color: #f8fafc;
            border-left: 4px solid #2563eb;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 8px;
          }
          .exercicio-titulo {
            font-size: 20px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 10px;
          }
          .exercicio-detalhes {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin: 10px 0;
          }
          .detalhe {
            background: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            border: 1px solid #e2e8f0;
          }
          .video-link {
            display: inline-block;
            background: #dc2626;
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            text-decoration: none;
            margin-top: 10px;
            font-weight: 500;
          }
          .video-link:hover {
            background: #b91c1c;
          }
          .observacao {
            background: #fef3c7;
            border-left: 3px solid #f59e0b;
            padding: 12px;
            margin-top: 10px;
            border-radius: 4px;
            font-size: 14px;
          }
          .grupo-set {
            background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
            color: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 12px;
          }
          .grupo-set-titulo {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          .exercicio-grupo {
            background: rgba(255,255,255,0.2);
            padding: 12px;
            margin-bottom: 10px;
            border-radius: 6px;
            backdrop-filter: blur(10px);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e2e8f0;
            color: #64748b;
          }
          @media (max-width: 600px) {
            body { padding: 10px; }
            .container { padding: 20px; }
            h1 { font-size: 24px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏋️ ${treino.titulo}</h1>
            ${cliente ? `<p style="color: #64748b; font-size: 16px;">Olá, ${cliente.nome}!</p>` : ''}
          </div>
          
          <div class="info">
            ${treino.descricao ? `<p>📋 ${treino.descricao}</p>` : ''}
            <p>⏱️ <strong>Duração estimada:</strong> ${treino.duracao_estimada} minutos</p>
            <p>💪 <strong>Tipo:</strong> ${treino.tipo.toUpperCase()}</p>
          </div>
    `;

    treino.exercicios.forEach((item, index) => {
      if (item.tipo_item === 'exercicio') {
        html += `
          <div class="exercicio">
            <div class="exercicio-titulo">${index + 1}. ${item.nome}</div>
            <div class="exercicio-detalhes">
              <div class="detalhe">🎯 ${item.grupo_muscular}</div>
              <div class="detalhe">📊 ${item.series} séries</div>
              ${item.tipo_execucao === 'tempo' 
                ? `<div class="detalhe">⏱️ ${item.tempo_execucao}s</div>`
                : `<div class="detalhe">🔢 ${item.repeticoes} reps</div>`
              }
              ${item.descanso ? `<div class="detalhe">⏸️ ${item.descanso}</div>` : ''}
            </div>
            ${item.video_url ? `
              <a href="${item.video_url}" class="video-link" target="_blank">
                📹 Assistir Vídeo Demonstrativo
              </a>
            ` : ''}
            ${item.observacoes ? `
              <div class="observacao">
                💡 <strong>Dica:</strong> ${item.observacoes}
              </div>
            ` : ''}
          </div>
        `;
      } else {
        const tipoLabels = {
          'bi-set': 'BI-SET',
          'tri-set': 'TRI-SET',
          'giga-set': 'GIGA-SET'
        };
        
        html += `
          <div class="grupo-set">
            <div class="grupo-set-titulo">
              ${index + 1}. ${tipoLabels[item.tipo_item]} ⚡
            </div>
            <p style="margin-bottom: 15px; opacity: 0.9;">
              Executar ${item.series} séries em sequência sem pausa entre exercícios
            </p>
        `;
        
        item.exercicios_grupo?.forEach((ex, exIdx) => {
          html += `
            <div class="exercicio-grupo">
              <div style="font-weight: bold; margin-bottom: 5px;">
                ${String.fromCharCode(97 + exIdx).toUpperCase()}) ${ex.nome}
              </div>
              <div style="font-size: 14px;">
                ${ex.tipo_execucao === 'tempo' 
                  ? `⏱️ ${ex.tempo_execucao}s` 
                  : `🔢 ${ex.repeticoes} reps`
                }
              </div>
              ${ex.video_url ? `
                <a href="${ex.video_url}" style="color: white; text-decoration: underline; font-size: 13px; margin-top: 5px; display: inline-block;" target="_blank">
                  📹 Ver vídeo
                </a>
              ` : ''}
            </div>
          `;
        });
        
        if (item.descanso) {
          html += `<p style="margin-top: 15px; opacity: 0.9;">⏸️ Descanso após o grupo: ${item.descanso}</p>`;
        }
        
        html += `</div>`;
      }
    });

    html += `
          <div class="footer">
            <p style="font-size: 18px; font-weight: bold; color: #2563eb;">💪 Bom treino!</p>
            <p>📱 Em caso de dúvidas, entre em contato.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const handleEnviarEmail = async () => {
    if (!cliente || !cliente.email) {
      toast.error("Cliente sem e-mail cadastrado");
      return;
    }

    setEnviandoEmail(true);
    setEmailEnviado(false);

    try {
      const htmlBody = formatarTreinoHTML(treino);
      
      // Criar link mailto com o conteúdo HTML
      const subject = encodeURIComponent(`🏋️ Seu Treino: ${treino.titulo}`);
      const body = encodeURIComponent(htmlBody);
      const mailtoLink = `mailto:${cliente.email}?subject=${subject}&body=${body}`;
      
      // Abrir cliente de email padrão
      window.location.href = mailtoLink;
      
      setEmailEnviado(true);
      toast.success(`Abrindo cliente de e-mail para ${cliente.email}`);
      
      setTimeout(() => {
        setEmailEnviado(false);
      }, 3000);
    } catch (error) {
      console.error("Erro ao abrir cliente de e-mail:", error);
      toast.error("Erro ao abrir cliente de e-mail. Tente novamente.");
    } finally {
      setEnviandoEmail(false);
    }
  };

  const handleCopiarTexto = async () => {
    try {
      const texto = formatarTreinoTexto(treino);
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      toast.success("Treino copiado para área de transferência!");
      
      setTimeout(() => {
        setCopiado(false);
      }, 3000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
      toast.error("Erro ao copiar. Tente novamente.");
    }
  };

  const handleEnviarWhatsApp = () => {
    if (!cliente || !cliente.telefone) {
      toast.error("Cliente sem telefone cadastrado");
      return;
    }

    try {
      const texto = formatarTreinoTexto(treino);
      
      // Limpar telefone (remover caracteres especiais)
      let telefone = cliente.telefone.replace(/\D/g, '');
      
      // Adicionar código do país se não tiver (55 para Brasil)
      if (!telefone.startsWith('55') && telefone.length <= 11) {
        telefone = '55' + telefone;
      }
      
      const mensagemEncoded = encodeURIComponent(texto);
      const urlWhatsApp = `https://wa.me/${telefone}?text=${mensagemEncoded}`;
      
      window.open(urlWhatsApp, '_blank');
      toast.success("Abrindo WhatsApp...");
    } catch (error) {
      console.error("Erro ao abrir WhatsApp:", error);
      toast.error("Erro ao abrir WhatsApp. Verifique o número do cliente.");
    }
  };

  if (!treino) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Compartilhar Treino
          </DialogTitle>
          <p className="text-sm text-slate-600 mt-2">
            {treino.titulo}
          </p>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          {/* Enviar por E-mail */}
          <Button
            onClick={handleEnviarEmail}
            disabled={!cliente?.email || enviandoEmail}
            className="w-full h-auto py-4 px-6 bg-blue-600 hover:bg-blue-700 text-left justify-start"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                {enviandoEmail ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : emailEnviado ? (
                  <CheckCircle className="w-5 h-5 text-white" />
                ) : (
                  <Mail className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white">Enviar por E-mail</div>
                <div className="text-xs text-blue-100 mt-0.5 truncate">
                  {cliente?.email ? cliente.email : 'E-mail não cadastrado'}
                </div>
              </div>
            </div>
          </Button>

          {/* Copiar Texto */}
          <Button
            onClick={handleCopiarTexto}
            variant="outline"
            className="w-full h-auto py-4 px-6 text-left justify-start border-2 hover:bg-slate-50"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                {copiado ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-slate-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900">Copiar Texto</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Copiar treino formatado para compartilhar
                </div>
              </div>
            </div>
          </Button>

          {/* Enviar WhatsApp */}
          <Button
            onClick={handleEnviarWhatsApp}
            disabled={!cliente?.telefone}
            className="w-full h-auto py-4 px-6 bg-green-600 hover:bg-green-700 text-left justify-start"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white">Enviar via WhatsApp</div>
                <div className="text-xs text-green-100 mt-0.5 truncate">
                  {cliente?.telefone ? cliente.telefone : 'Telefone não cadastrado'}
                </div>
              </div>
            </div>
          </Button>
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            onClick={onClose}
            className="w-full"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}