import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserPreference } from "./UserPreference";

@Entity("theme", { schema: "business_manager" })
export class Theme {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @Column("varchar", { name: "style_file_path", length: 100 })
  styleFilePath: string;

  @OneToMany(() => UserPreference, (userPreference) => userPreference.theme)
  userPreferences: UserPreference[];
}
