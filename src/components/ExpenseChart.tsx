import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ExpenseChartProps {
  data: {
    name: string
    amount: number
    color: string
    icon?: React.ReactNode
  }[]
  title: string
}

export const ExpenseChart = ({ data, title }: ExpenseChartProps) => {
  const RADIAN = Math.PI / 180

  // Label customizado para fatias maiores que 5%
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    if (percent < 0.05) return null
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
        aria-label={`Porcentagem: ${(percent * 100).toFixed(0)}%`}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  // Tooltip customizado acessível
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg max-w-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">{data.icon}</span>
            <span className="font-medium text-sm">{data.name}</span>
          </div>
          <p className="text-sm text-muted-foreground">
            R$ {data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      )
    }
    return null
  }

  // Legenda customizada, responsiva e acessível
  const CustomLegend = ({ payload }: any) => {
    if (!payload || payload.length === 0) return null
    return (
      <div className="flex flex-wrap justify-center gap-2 lg:gap-4 mt-4 px-2">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center gap-1 lg:gap-2 min-w-0">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
              aria-label={`Cor da categoria ${entry.name}`}
            />
            <span className="text-xs lg:text-sm truncate">
              {entry.icon} {entry.name}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Mensagem para ausência de dados
  if (!data || data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="px-4 lg:px-6 py-4 lg:py-6">
          <CardTitle className="text-base lg:text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-48 lg:h-64 px-4 lg:px-6">
          <p className="text-muted-foreground text-sm lg:text-base">Nenhum dado disponível</p>
        </CardContent>
      </Card>
    )
  }

  // Responsividade para o raio do gráfico
  const getOuterRadius = () => (window.innerWidth < 768 ? 80 : 100)

  return (
    <Card className="h-full">
      <CardHeader className="px-4 lg:px-6 py-4 lg:py-6">
        <CardTitle className="text-base lg:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={getOuterRadius()}
              fill="#8884d8"
              dataKey="amount"
              isAnimationActive={true}
              aria-label="Gráfico de pizza de despesas por categoria"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
