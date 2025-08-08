import dayjs from 'dayjs'

export const formatDate = (date: string, format: string = "MMM D") => {
    return dayjs(date).format(format);  // Retornar el valor formateado correctamente
}

export const formatCurrency = (amount: number) => {
    return `$ ${amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}
