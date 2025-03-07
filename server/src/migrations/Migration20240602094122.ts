import { Migration } from '@mikro-orm/migrations';

export class Migration20240602094122 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("id" serial primary key, "created_at" date not null, "updated_at" timestamptz not null, "title" varchar(255) not null);');
  }

}
