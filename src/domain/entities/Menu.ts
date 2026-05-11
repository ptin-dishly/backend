export class Menu {
  constructor(
    readonly id: string,
    readonly establishmentId: string,
    readonly name: string,
    readonly isPublic: boolean,
    readonly qrCodeUrl: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
    readonly items?: any[]
  ) {}
}
