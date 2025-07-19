import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface TrendData {
  month: string;
  income: number;
  expenses: number;
}

interface TrendChartProps {
  data: TrendData[];
  title?: string;
  height?: number;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  title,
  height = 300,
}) => {
  // Componente customizado para o tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const income = payload.find((p: any) => p.dataKey === 'income');
      const expenses = payload.find((p: any) => p.dataKey === 'expenses');
      const balance = income?.value - expenses?.value;

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-green-600">
              Receitas: {formatCurrency(income?.value || 0)}
            </p>
            <p className="text-sm text-red-600">
              Despesas: {formatCurrency(expenses?.value || 0)}
            </p>
            <hr className="my-1" />
            <p className={`text-sm font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Saldo: {formatCurrency(balance)}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Função para formatar valores no eixo Y
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return `R$ ${value}`;
  };

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">Nenhum dado disponível</p>
          <p className="text-sm">Adicione algumas transações para ver o gráfico</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-center mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={formatYAxis} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="income" 
            fill="#10b981" 
            name="Receitas"
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="expenses" 
            fill="#ef4444" 
            name="Despesas"
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
      
      {/* Resumo estatístico */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-sm text-green-600 font-medium">Receitas Totais</p>
          <p className="text-lg font-bold text-green-700">
            {formatCurrency(data.reduce((sum, item) => sum + item.income, 0))}
          </p>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <p className="text-sm text-red-600 font-medium">Despesas Totais</p>
          <p className="text-lg font-bold text-red-700">
            {formatCurrency(data.reduce((sum, item) => sum + item.expenses, 0))}
          </p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-sm text-blue-600 font-medium">Saldo Total</p>
          <p className={`text-lg font-bold ${
            data.reduce((sum, item) => sum + (item.income - item.expenses), 0) >= 0 
              ? 'text-green-700' 
              : 'text-red-700'
          }`}>
            {formatCurrency(data.reduce((sum, item) => sum + (item.income - item.expenses), 0))}
          </p>
        </div>
      </div>
    </div>
  );
};
