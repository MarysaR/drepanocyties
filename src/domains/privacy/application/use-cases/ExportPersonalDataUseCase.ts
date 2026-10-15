/**
 * Produit l'export complet des données personnelles de la personne.
 */
import type { Clock } from '@shared/domain/Clock'
import type { UserId } from '@shared/domain/UserId'
import type { PersonalDataExportDocument } from '../dto/PersonalDataExport'
import type { PersonalDataCollector } from '../ports/PersonalDataPorts'

const EXPORT_NOTICE = 'Export des données conservées par l’application. Les messages transmis au fournisseur d’IA sont soumis à sa propre politique de conservation.'

export class ExportPersonalDataUseCase {
  constructor(private readonly collector: PersonalDataCollector, private readonly clock: Clock) {}

  async execute(userId: UserId): Promise<PersonalDataExportDocument> {
    const data = await this.collector.collect(userId)
    return { exportedAt: this.clock.now().toISOString(), notice: EXPORT_NOTICE, ...data }
  }
}
