import type {Priority, TicketStatus} from "./constants"

export type Ticket = {
    id: string
    status: TicketStatus
    createdAt: Date
    updatedAt: Date

    // 表单字段
    title: string
    companyName: string
    customerName: string
    description: string
    priority: Priority
    assigneeName: string
}