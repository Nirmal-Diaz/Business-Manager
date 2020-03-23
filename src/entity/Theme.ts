import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserPreference } from "./UserPreference";

@Entity("theme", { schema: "d" })
export class Theme {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 45 })
  name: string;

  @Column("varchar", { name: "css_path", length: 100 })
  cssPath: string;

  @OneToMany(
    () => UserPreference,
    userPreference => userPreference.theme
  )
  userPreferences: UserPreference[];
}
