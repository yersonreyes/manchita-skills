import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/authService/auth.service';
import { UiDialogService } from '@core/services/ui-dialog.service';
import {
  AreaProfesional,
  NivelCompetencia,
  Senioridad,
  TipoDisponibilidad,
} from '@core/services/userService/user.req.dto';
import { UserSkillDto } from '@core/services/userService/user.res.dto';
import { UserService } from '@core/services/userService/user.service';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Tooltip } from 'primeng/tooltip';

interface SelectOption<T> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    FormsModule,
    Button,
    Dialog,
    InputText,
    InputNumber,
    Select,
    Textarea,
    Tooltip,
    PageHeaderComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.sass',
})
export class ProfileComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly uiDialog = inject(UiDialogService);

  readonly user = this.authService.user;
  readonly permissions = this.authService.userPermissions;
  readonly isSuperAdmin = this.authService.isSuperAdmin;

  loading = signal(true);
  savingProfile = signal(false);
  savingSkills = signal(false);

  // ─── Avatar modal ──────────────────────────────────────────────────────────
  avatarModalVisible = signal(false);
  avatarPreview = signal<string | null>(null);
  avatarUploading = signal(false);
  selectedAvatarFile: File | null = null;

  profileForm = {
    nombre: '',
    bio: '',
    telefono: '',
    zonaHoraria: '',
    horasSemanales: null as number | null,
    area: null as AreaProfesional | null,
    senioridad: null as Senioridad | null,
    disponibilidad: null as TipoDisponibilidad | null,
    lenguajes: [] as string[],
    frameworks: [] as string[],
    basesDeDatos: [] as string[],
    herramientas: [] as string[],
  };

  stackInputs: Record<string, string> = {
    lenguajes: '',
    frameworks: '',
    basesDeDatos: '',
    herramientas: '',
  };

  skills = signal<UserSkillDto[]>([]);
  newSkillTecnologia = '';
  newSkillNivel: NivelCompetencia = 'INTERMEDIO';

  readonly stackFields = [
    { key: 'lenguajes', label: 'Lenguajes', placeholder: 'TypeScript, Python…' },
    { key: 'frameworks', label: 'Frameworks', placeholder: 'Angular, NestJS…' },
    { key: 'basesDeDatos', label: 'Bases de datos', placeholder: 'PostgreSQL, Redis…' },
    { key: 'herramientas', label: 'Herramientas', placeholder: 'Docker, CI/CD…' },
  ] as const;

  readonly areaOptions: SelectOption<AreaProfesional>[] = [
    { label: 'Frontend', value: 'FRONTEND' },
    { label: 'Backend', value: 'BACKEND' },
    { label: 'Fullstack', value: 'FULLSTACK' },
    { label: 'QA', value: 'QA' },
    { label: 'DevOps', value: 'DEVOPS' },
    { label: 'UX', value: 'UX' },
    { label: 'Diseño', value: 'DISENO' },
    { label: 'Producto', value: 'PRODUCTO' },
    { label: 'Datos', value: 'DATOS' },
    { label: 'Management', value: 'MANAGEMENT' },
    { label: 'Otro', value: 'OTRO' },
  ];

  readonly senioridadOptions: SelectOption<Senioridad>[] = [
    { label: 'Junior', value: 'JUNIOR' },
    { label: 'Semi Sr.', value: 'SEMI_SENIOR' },
    { label: 'Senior', value: 'SENIOR' },
    { label: 'Lead', value: 'LEAD' },
    { label: 'Principal', value: 'PRINCIPAL' },
  ];

  readonly disponibilidadOptions: SelectOption<TipoDisponibilidad>[] = [
    { label: 'Full Time', value: 'FULL_TIME' },
    { label: 'Part Time', value: 'PART_TIME' },
    { label: 'Freelance', value: 'FREELANCE' },
    { label: 'Consultor', value: 'CONSULTOR' },
  ];

  readonly nivelOptions: SelectOption<NivelCompetencia>[] = [
    { label: 'Básico', value: 'BASICO' },
    { label: 'Intermedio', value: 'INTERMEDIO' },
    { label: 'Avanzado', value: 'AVANZADO' },
  ];

  ngOnInit(): void {
    void this.loadFullProfile();
  }

  private async loadFullProfile(): Promise<void> {
    const currentUser = this.user();
    if (!currentUser) return;
    this.loading.set(true);
    try {
      const full = await this.userService.getById(currentUser.id);
      this.initForm(full as any);
      this.skills.set(full.userSkills ?? []);
      this.authService.user.set({ ...currentUser, avatarUrl: full.avatarUrl });
    } catch {
      this.initForm(currentUser as any);
    } finally {
      this.loading.set(false);
    }
  }

  private initForm(u: any): void {
    this.profileForm = {
      nombre: u.nombre ?? '',
      bio: u.bio ?? '',
      telefono: u.telefono ?? '',
      zonaHoraria: u.zonaHoraria ?? '',
      horasSemanales: u.horasSemanales ?? null,
      area: u.area ?? null,
      senioridad: u.senioridad ?? null,
      disponibilidad: u.disponibilidad ?? null,
      lenguajes: [...(u.lenguajes ?? [])],
      frameworks: [...(u.frameworks ?? [])],
      basesDeDatos: [...(u.basesDeDatos ?? [])],
      herramientas: [...(u.herramientas ?? [])],
    };
  }

  addStackItem(field: 'lenguajes' | 'frameworks' | 'basesDeDatos' | 'herramientas'): void {
    const val = this.stackInputs[field]?.trim();
    if (!val) return;
    if (!this.profileForm[field].includes(val)) {
      this.profileForm[field] = [...this.profileForm[field], val];
    }
    this.stackInputs[field] = '';
  }

  removeStackItem(
    field: 'lenguajes' | 'frameworks' | 'basesDeDatos' | 'herramientas',
    item: string,
  ): void {
    this.profileForm[field] = this.profileForm[field].filter((i) => i !== item);
  }

  togglePill<T>(field: keyof typeof this.profileForm, value: T): void {
    const current = (this.profileForm as any)[field];
    (this.profileForm as any)[field] = current === value ? null : value;
  }

  async saveProfile(): Promise<void> {
    const u = this.user();
    if (!u) return;
    this.savingProfile.set(true);
    try {
      const updated = await this.userService.update(u.id, {
        nombre: this.profileForm.nombre.trim() || undefined,
        bio: this.profileForm.bio || undefined,
        telefono: this.profileForm.telefono || undefined,
        zonaHoraria: this.profileForm.zonaHoraria || undefined,
        horasSemanales: this.profileForm.horasSemanales ?? undefined,
        area: this.profileForm.area ?? undefined,
        senioridad: this.profileForm.senioridad ?? undefined,
        disponibilidad: this.profileForm.disponibilidad ?? undefined,
        lenguajes: this.profileForm.lenguajes,
        frameworks: this.profileForm.frameworks,
        basesDeDatos: this.profileForm.basesDeDatos,
        herramientas: this.profileForm.herramientas,
      });
      this.authService.user.set({ ...u, nombre: updated.nombre });
      this.uiDialog.showSuccess('Perfil guardado', 'Tus datos fueron actualizados');
    } catch {
      // handled by builder
    } finally {
      this.savingProfile.set(false);
    }
  }

  addSkill(): void {
    const tec = this.newSkillTecnologia.trim();
    if (!tec) return;
    if (this.skills().some((s) => s.tecnologia.toLowerCase() === tec.toLowerCase())) {
      this.uiDialog.showWarn('Duplicado', 'Esa tecnología ya está en la lista');
      return;
    }
    this.skills.update((s) => [...s, { id: 0, tecnologia: tec, nivel: this.newSkillNivel }]);
    this.newSkillTecnologia = '';
  }

  removeSkill(tecnologia: string): void {
    this.skills.update((s) => s.filter((sk) => sk.tecnologia !== tecnologia));
  }

  async saveSkills(): Promise<void> {
    const u = this.user();
    if (!u) return;
    this.savingSkills.set(true);
    try {
      const updated = await this.userService.upsertSkills(u.id, {
        skills: this.skills().map((s) => ({ tecnologia: s.tecnologia, nivel: s.nivel })),
      });
      this.skills.set(updated.userSkills ?? []);
      this.uiDialog.showSuccess('Habilidades guardadas', 'Tu nivel de competencia fue actualizado');
    } catch {
      // handled
    } finally {
      this.savingSkills.set(false);
    }
  }

  openAvatarModal(): void {
    this.avatarPreview.set(null);
    this.selectedAvatarFile = null;
    this.avatarModalVisible.set(true);
  }

  onAvatarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedAvatarFile = file;
    const reader = new FileReader();
    reader.onload = (e) => this.avatarPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async confirmAvatarUpload(): Promise<void> {
    const u = this.user();
    if (!u || !this.selectedAvatarFile) return;
    this.avatarUploading.set(true);
    try {
      const updated = await this.userService.uploadAvatar(u.id, this.selectedAvatarFile);
      this.authService.user.set({ ...u, avatarUrl: updated.avatarUrl });
      this.avatarModalVisible.set(false);
      this.uiDialog.showSuccess('Avatar actualizado', 'Tu foto de perfil fue guardada');
    } catch {
      // handled by builder
    } finally {
      this.avatarUploading.set(false);
    }
  }

  getNivelLabel(nivel: NivelCompetencia): string {
    return this.nivelOptions.find((o) => o.value === nivel)?.label ?? nivel;
  }

  getAreaLabel(area: AreaProfesional | null): string {
    if (!area) return '';
    return this.areaOptions.find((o) => o.value === area)?.label ?? area;
  }
}
