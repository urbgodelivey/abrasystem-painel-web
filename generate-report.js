import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';

async function createPdf() {
  console.log('Iniciando a geração do PDF...');
  
  // Cria um novo PDF
  const pdfDoc = await PDFDocument.create();

  // Carrega fontes padrão do PDF
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // Dimensões A4 (595.27 x 841.89 points)
  const pageHeight = 841.89;
  const pageWidth = 595.27;
  const margin = 50;
  const contentWidth = pageWidth - (margin * 2);

  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Função auxiliar para desenhar textos com quebra de linha automática
  function addText(text, fontSize = 10, isBold = false, isOblique = false, spacing = 1.25) {
    const activeFont = isBold ? boldFont : (isOblique ? fontOblique : font);
    const textHeight = fontSize * spacing;

    // Quebra o texto por palavras
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = activeFont.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > contentWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }

    // Escreve cada linha na página, criando uma nova página se estourar
    for (const line of lines) {
      if (y - textHeight < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      currentPage.drawText(line, {
        x: margin,
        y: y - fontSize,
        size: fontSize,
        font: activeFont,
        color: rgb(0.12, 0.12, 0.12),
      });
      y -= textHeight;
    }
    y -= 4; // Espaçamento extra depois do bloco de texto
  }

  // Função auxiliar para criar títulos formatados
  function addHeading(text, level = 1) {
    const size = level === 1 ? 16 : (level === 2 ? 12 : 10);
    const spaceBefore = level === 1 ? 20 : 12;
    const spaceAfter = 6;
    
    y -= spaceBefore;
    if (y < margin + 40) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    
    // Desenha linha dourada decorativa embaixo dos títulos nível 1
    if (level === 1) {
      currentPage.drawRectangle({
        x: margin,
        y: y - size - 4,
        width: contentWidth,
        height: 1.5,
        color: rgb(0.83, 0.63, 0.09), // Dourado
      });
    }
    
    currentPage.drawText(text, {
      x: margin,
      y: y - size,
      size: size,
      font: boldFont,
      color: level === 1 ? rgb(0.83, 0.63, 0.09) : rgb(0.18, 0.18, 0.18),
    });
    
    y -= (size + spaceAfter);
  }

  // Função auxiliar para criar itens de lista (bullets)
  function addBullet(text) {
    if (y - 14 < margin) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
    
    // Desenha a bolinha (dourada)
    currentPage.drawText('•', {
      x: margin + 5,
      y: y - 10,
      size: 11,
      font: boldFont,
      color: rgb(0.83, 0.63, 0.09),
    });
    
    const bulletIndent = 18;
    const textWidth = contentWidth - bulletIndent;
    
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, 9.5);
      if (testWidth > textWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) {
      lines.push(currentLine);
    }
    
    for (const line of lines) {
      if (y - 12 < margin) {
        currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      currentPage.drawText(line, {
        x: margin + bulletIndent,
        y: y - 9.5,
        size: 9.5,
        font: font,
        color: rgb(0.15, 0.15, 0.15),
      });
      y -= 12;
    }
    y -= 3; // Espaço depois do bullet
  }

  // ═══════════════════════════════════════════
  // CABEÇALHO / CAPA DO DOCUMENTO
  // ═══════════════════════════════════════════
  y -= 30;
  
  currentPage.drawText('AbraSystem', {
    x: margin,
    y: y,
    size: 26,
    font: boldFont,
    color: rgb(0.72, 0.09, 0.09), // Vermelho da marca (Dog King)
  });
  
  currentPage.drawText(' O MELHOR DELIVERY', {
    x: margin + 155,
    y: y + 2,
    size: 10,
    font: boldFont,
    color: rgb(0.83, 0.63, 0.09), // Dourado
  });

  y -= 25;
  
  currentPage.drawRectangle({
    x: margin,
    y: y,
    width: contentWidth,
    height: 2,
    color: rgb(0.83, 0.63, 0.09),
  });
  
  y -= 25;

  addText('Apresentação Geral de Funcionalidades do Sistema', 14, true);
  addText('Documento Guia para Uso Interno e Vendas (Time Comercial)', 10.5, false, true);
  addText('Data de Emissão: ' + new Date().toLocaleDateString('pt-BR') + ' | Versão do Painel: 1.0.0', 8.5, false, false);
  
  y -= 15;

  // ═══════════════════════════════════════════
  // CONTEÚDO
  // ═══════════════════════════════════════════
  addHeading('1. Introdução Comercial', 1);
  addText('O AbraSystem é o painel administrativo de logística definitivo, construído especialmente para apoiar as operações de delivery do Dog King. Criado para ser simples, rápido e visual, ele atua reduzindo o estresse operacional, dando total transparência de onde estão as entregas e organizando a saúde financeira da empresa em segundos.');

  addHeading('2. Módulo de Operação', 1);
  
  addHeading('2.1 Dashboard do Painel', 2);
  addText('O coração operacional do sistema. Traz indicadores rápidos da performance do dia, semana ou mês, facilitando decisões rápidas de gerenciamento:');
  addBullet('KPIs Consolidados: Total de entregas iniciadas, entregues com sucesso, em andamento, canceladas, faturamento do período e número de entregadores ativos.');
  addBullet('Gráficos de Produtividade: Painel visual mostrando as vendas por hora do dia e o faturamento total acumulado nos últimos 7 dias.');
  addBullet('Ranking de Entregadores: Lista automática que destaca os motoboys mais rápidos e bem avaliados da equipe.');
  addBullet('Histórico de Atividades: Feed em tempo real registrando criações de pedidos, saídas de motoboys e entregas finalizadas.');

  addHeading('2.2 Gestão de Entregas', 2);
  addBullet('Status das Corridas: Tela centralizadora para acompanhar o status de cada pedido (Pendente, Atribuído, Em rota, Concluído e Cancelado).');
  addBullet('Filtros e Exportação: Permite localizar qualquer entrega por código ou nome de loja, filtrando rapidamente por período e exportando relatórios completos em formato de planilha Excel/CSV.');

  addHeading('2.3 Mapa ao Vivo', 2);
  addBullet('Rastreamento em Tempo Real: Exibe a localização dos motoboys integrados pelo GPS diretamente em um mapa interativo, facilitando o suporte ao cliente e otimizando a distribuição de pedidos subsequentes.');

  addHeading('3. Módulo de Cadastros', 1);
  
  addHeading('3.1 Lojas (Nova Funcionalidade)', 2);
  addText('Substituindo o antigo menu de "Clientes", a seção de Lojas é focada em organizar os estabelecimentos parceiros ou filiais que solicitam entregas:');
  addBullet('Perfil do Estabelecimento: Cadastro com nome fantasia, telefone, e-mail de contato, CNPJ/CPF e localização detalhada.');
  addBullet('Métricas Comerciais: Exibe o faturamento total da loja no período, quantidade total de entregas efetuadas e a data da última venda.');
  addBullet('Status Comercial: Categorização da loja em "Ativa", "Inativa" (sem uso recente) ou "Inadimplente" (bloqueio automático de pedidos de entrega em caso de pendências financeiras).');
  addBullet('Ações Rápidas: Atalhos que abrem chamadas de voz, e-mails ou mensagens pré-formatadas diretamente no WhatsApp do gerente da loja parceira.');

  addHeading('3.2 Entregadores', 2);
  addBullet('Gestão de Frota: Fichas com tipo de veículo utilizado (Moto, Bike, Carro, Van), placa oficial, status operacional atual (Disponível, Em rota, Em pausa ou Inativo) e histórico acumulado.');

  addHeading('3.3 Tabelas de Preço', 2);
  addBullet('Tarifas Customizadas: Permite criar regras flexíveis de preços cobrados pelas entregas por quilometragem (distância) ou bairro, otimizando as margens logísticas.');

  addHeading('4. Módulo Financeiro Simplificado (Nova Funcionalidade)', 1);
  addText('Em conformidade com a solicitação de simplificação total das finanças, removemos os módulos genéricos antigos de Contas a Receber, Caixa, Bancos e Faturamento. Agora, o financeiro do sistema conta com apenas uma tela altamente focada no que realmente importa: **"Motoboys a Pagar"**.');
  addBullet('Fechamento de Caixa Sem Complicações: Exibe uma lista com todos os motoboys que possuem valores pendentes de acerto de corridas.');
  addBullet('Visualização Direta do PIX: Exibe na hora o nome do banco, tipo de chave e a chave PIX (CPF, Celular, E-mail ou Aleatória) de cada motoboy, eliminando a necessidade de buscar esses dados em planilhas externas.');
  addBullet('Demonstrativo de Valores: Mostra o número de corridas executadas no período, o valor base a pagar pelas entregas, taxas adicionais/bônus do entregador e o saldo final a ser transferido.');
  addBullet('Liquidação Rápida ("Pagar PIX"): Abre um modal de confirmação com os dados resumidos do repasse. Ao confirmar, o sistema dá baixa na dívida, atualiza o status para "Pago" com a data correspondente e recalcula os KPIs consolidados na hora.');
  addBullet('Atalho WhatsApp: Com um clique, envia uma mensagem preenchida com o comprovante do acerto direto para o motoboy parceiro.');

  addHeading('5. Mensageria Automática (Exclusivo WhatsApp) - Argumentos de Venda', 1);
  addText('O módulo de Mensageria Automática via WhatsApp é o principal trunfo de atração para convencer novas lojas e franqueados a usar o AbraSystem. Aqui está uma explicação sem termos técnicos para que o time comercial possa encantar os clientes:');
  
  addHeading('O que é e como funciona?', 3);
  addText('O sistema conecta-se de forma inteligente ao WhatsApp da empresa. A partir do momento em que o operador despacha uma entrega no painel, o sistema envia automaticamente uma mensagem para o WhatsApp do cliente final. O cliente recebe uma mensagem amigável contendo o status atualizado e um link para acompanhar, em tempo real no mapa do celular dele, onde o motoboy está.');

  addHeading('Principais Benefícios de Venda (Use com os Clientes):', 3);
  addBullet('1. Fim da Ansiedade e das Ligações: O cliente final sabe exatamente onde a comida dele está. Isso elimina até 80% das chamadas chatas no telefone do restaurante perguntando "cadê meu pedido?", deixando a equipe focada apenas em produzir e vender.');
  addBullet('2. Sem Trabalho Manual para a Equipe: Os atendentes não precisam perder tempo copiando e colando mensagens como "seu pedido saiu para entrega" no celular. O painel cuida disso de forma 100% autônoma no exato segundo em que o entregador recolhe o pacote.');
  addBullet('3. Avaliações 5 Estrelas automáticas: A transparência e o aviso rápido encantam os clientes, que passam a dar notas muito mais altas no iFood e no Google, subindo o prestígio da loja perante a concorrência.');
  addBullet('4. Garantia de Segurança de Número: O sistema utiliza rotas de templates oficiais pré-aprovados pela Meta, blindando o número de WhatsApp contra denúncias e bloqueios de chips corporativos.');

  // Salva o arquivo final
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync('relatorio_funcionalidades.pdf', pdfBytes);
  console.log('Relatório PDF comercial gerado com sucesso na raiz do projeto!');
}

createPdf().catch(console.error);
