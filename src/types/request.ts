import { Panel } from './panel';
import { Controller } from './controller';

export interface PanelRequest {
  id: string;
  requestedPanel: Omit<Panel, 'id'>;
  requestedBy: string; // User email or identifier
  requestNotes?: string; // User-provided notes about the request
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  reviewedBy?: string; // Admin email
  reviewedAt?: Date;
}

export interface ControllerRequest {
  id: string;
  requestedController: Omit<Controller, 'id'>;
  requestedBy: string; // User email or identifier
  requestNotes?: string; // User-provided notes about the request
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  reviewedBy?: string; // Admin email
  reviewedAt?: Date;
}

export type RequestStatus = 'pending' | 'approved' | 'rejected';
