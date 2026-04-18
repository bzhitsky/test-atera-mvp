import { Injectable, inject, OnDestroy } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SignalRService implements OnDestroy {
  private connection: HubConnection | null = null;
  private readonly auth = inject(AuthService);

  private build(): HubConnection {
    return new HubConnectionBuilder()
      .withUrl(`${environment.signalrUrl}/order-status`, {
        accessTokenFactory: () => this.auth.token() ?? '',
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();
  }

  private get conn(): HubConnection {
    if (!this.connection) this.connection = this.build();
    return this.connection;
  }

  async ensureConnected(): Promise<void> {
    if (this.conn.state === HubConnectionState.Disconnected) {
      await this.conn.start();
    }
  }

  async joinOrderGroup(orderId: number): Promise<void> {
    await this.ensureConnected();
    await this.conn.invoke('JoinOrderGroup', String(orderId));
  }

  async leaveOrderGroup(orderId: number): Promise<void> {
    if (this.connection?.state === HubConnectionState.Connected) {
      await this.connection.invoke('LeaveOrderGroup', String(orderId));
    }
  }

  onOrderStatusUpdated(handler: (order: unknown) => void): () => void {
    this.conn.on('OrderStatusUpdated', handler);
    return () => this.conn.off('OrderStatusUpdated', handler);
  }

  ngOnDestroy(): void {
    this.connection?.stop();
  }
}
