import type { UseCase } from './UseCase';
import type { DoctorsService } from '@/application/services/DoctorsService';
import type { Doctor, DoctorInput } from '@/domain/entities/Doctor';
import type { EntityId } from '@/shared/types';

export class ListDoctorsUseCase implements UseCase<void, Doctor[]> {
  constructor(private readonly service: DoctorsService) {}
  execute(): Promise<Doctor[]> {
    return this.service.getAll();
  }
}

export class SaveDoctorUseCase implements UseCase<DoctorInput, Doctor> {
  constructor(private readonly service: DoctorsService) {}
  execute(input: DoctorInput): Promise<Doctor> {
    return this.service.save(input);
  }
}

export class DeleteDoctorUseCase implements UseCase<EntityId, void> {
  constructor(private readonly service: DoctorsService) {}
  execute(id: EntityId): Promise<void> {
    return this.service.remove(id);
  }
}

export class ToggleDoctorStatusUseCase implements UseCase<Doctor, Doctor> {
  constructor(private readonly service: DoctorsService) {}
  execute(doctor: Doctor): Promise<Doctor> {
    return this.service.toggleStatus(doctor);
  }
}
