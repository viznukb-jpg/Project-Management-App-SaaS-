ALTER TABLE "workspaces" DROP CONSTRAINT "workspaces_name_unique";--> statement-breakpoint
ALTER TABLE "workspaces" ADD CONSTRAINT "workspace_owner_name_uq" UNIQUE("owner_id","name");