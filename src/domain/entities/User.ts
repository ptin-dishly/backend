export type UserRole = "admin" | "sales" | "waiter" | "kitchen";

export class User {
  constructor(
    readonly id: string,
    readonly establishmentId: string,
    readonly email: string,
    readonly passwordHash: string,
    readonly name: string,
    readonly role: UserRole,
    readonly isActive: boolean,
    readonly lastLoginAt: Date | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}
}
