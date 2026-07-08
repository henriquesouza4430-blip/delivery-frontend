import React from 'react';
import { Check, Minus } from 'lucide-react'; // Certifique-se de ter o lucide-react instalado

interface ModuleRow {
  name: string;
  basic: boolean;
  pro: boolean;
  enterprise: boolean;
}

export default function PlanModules() {
  const modules: ModuleRow[] = [
    { name: 'PDV', basic: true, pro: true, enterprise: true },
    { name: 'Pedidos', basic: true, pro: true, enterprise: true },
    { name: 'Cozinha', basic: true, pro: true, enterprise: true },
    { name: 'Mesas', basic: true, pro: true, enterprise: true },
    { name: 'Cardápio Online', basic: true, pro: true, enterprise: true },
    { name: 'Cupons', basic: false, pro: true, enterprise: true },
    { name: 'Relatórios', basic: false, pro: true, enterprise: true },
    { name: 'WhatsApp IA', basic: false, pro: true, enterprise: true },
    { name: 'Multiunidades', basic: false, pro: false, enterprise: true },
    { name: 'White Label', basic: false, pro: false, enterprise: true },
  ];

  // Função disparada ao clicar no botão do plano
  const handleSelectPlan = (planId: string) => {
    // Substitua pelo redirecionamento ou lógica de abas do seu sistema
    console.log(`Plano selecionado: ${planId}`);
    window.location.href = `/checkout?plan=${planId}`;
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col items-center justify-center p-4 py-12 font-sans">
      
      {/* Cabeçalho */}
      <div className="text-center mb-10">
        <p className="text-zinc-400 text-base md:text-lg">
          Escolha o plano ideal para o tamanho da sua operação.
        </p>
      </div>

      {/* Container da Tabela */}
      <div className="w-full max-w-4xl bg-[#121214] rounded-2xl border border-zinc-800/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            
            {/* Header da Tabela com Botões de Preço */}
            <thead>
              <tr className="border-b border-zinc-800/50">
                <th className="p-5 w-2/5 min-w-[180px]"></th>
                <th className="p-5 text-center min-w-[140px]">
                  <div className="flex flex-col items-center gap-2">
                    <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                      Basic
                    </span>
                    <button 
                      onClick={() => handleSelectPlan('basic')}
                      className="w-full px-3 py-1.5 text-sm font-semibold text-zinc-300 bg-zinc-800/40 hover:bg-emerald-500/20 hover:text-emerald-400 border border-zinc-700/50 hover:border-emerald-500/40 rounded-lg transition-all duration-200 shadow-sm cursor-pointer"
                    >
                      R$ 39,90
                    </button>
                  </div>
                </th>
                <th className="p-5 text-center min-w-[140px]">
                  <div className="flex flex-col items-center gap-2">
                    <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 rounded-full border border-blue-500/20">
                      Pro
                    </span>
                    <button 
                      onClick={() => handleSelectPlan('pro')}
                      className="w-full px-3 py-1.5 text-sm font-semibold text-zinc-300 bg-zinc-800/40 hover:bg-blue-500/20 hover:text-blue-400 border border-zinc-700/50 hover:border-blue-500/40 rounded-lg transition-all duration-200 shadow-sm cursor-pointer"
                    >
                      R$ 89,90
                    </button>
                  </div>
                </th>
                <th className="p-5 text-center min-w-[140px]">
                  <div className="flex flex-col items-center gap-2">
                    <span className="inline-block px-4 py-1 text-xs font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 rounded-full border border-purple-500/20">
                      Enterprise
                    </span>
                    <button 
                      onClick={() => handleSelectPlan('enterprise')}
                      className="w-full px-3 py-1.5 text-sm font-semibold text-zinc-300 bg-zinc-800/40 hover:bg-purple-500/20 hover:text-purple-400 border border-zinc-700/50 hover:border-purple-500/40 rounded-lg transition-all duration-200 shadow-sm cursor-pointer"
                    >
                      R$ 149,90
                    </button>
                  </div>
                </th>
              </tr>
            </thead>

            {/* Corpo da Tabela */}
            <tbody className="divide-y divide-zinc-800/40">
              {modules.map((module, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-zinc-800/20 transition-colors duration-150"
                >
                  {/* Nome do Módulo */}
                  <td className="p-5 text-sm font-medium text-zinc-300">
                    {module.name}
                  </td>

                  {/* Coluna Basic */}
                  <td className="p-5 text-center">
                    <div className="flex justify-center items-center">
                      {module.basic ? (
                        <div className="p-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                          <Check className="w-4 h-4" strokeWidth={3} />
                        </div>
                      ) : (
                        <Minus className="w-4 h-4 text-zinc-700" />
                      )}
                    </div>
                  </td>

                  {/* Coluna Pro */}
                  <td className="p-5 text-center">
                    <div className="flex justify-center items-center">
                      {module.pro ? (
                        <div className="p-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500">
                          <Check className="w-4 h-4" strokeWidth={3} />
                        </div>
                      ) : (
                        <Minus className="w-4 h-4 text-zinc-700" />
                      )}
                    </div>
                  </td>

                  {/* Coluna Enterprise */}
                  <td className="p-5 text-center">
                    <div className="flex justify-center items-center">
                      {module.enterprise ? (
                        <div className="p-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-500">
                          <Check className="w-4 h-4" strokeWidth={3} />
                        </div>
                      ) : (
                        <Minus className="w-4 h-4 text-zinc-700" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
}