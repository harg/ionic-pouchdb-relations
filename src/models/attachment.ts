
enum AttachmentType {
    IMAGE,
    PDF,
    AUDIO
}

export class Attachment {

  _id?: string
  _rev?: string
  name: string;
  attachment_type: AttachmentType;
  model: string;
  model_id: string;



}