// Base domain entity interface
export interface DomainEntity {
  readonly id: string;
  equals(entity: DomainEntity): boolean;
}

// Base value object interface
export interface ValueObject {
  equals(valueObject: ValueObject): boolean;
}

// Domain event interface
export interface DomainEvent {
  readonly eventId: string;
  readonly occurredOn: Date;
  readonly eventType: string;
}

// Repository interface
export interface Repository<T extends DomainEntity> {
  findById(id: string): Promise<T | null>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}
