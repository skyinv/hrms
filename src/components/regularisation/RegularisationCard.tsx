import React from 'react';
import { format } from 'date-fns';
import Button from '../common/Button';
import { RegularisationRequest } from '../../types';

interface RegularisationCardProps {
  request: RegularisationRequest;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export default function RegularisationCard({ request, onApprove, onReject }: RegularisationCardProps) {
  return (
    <div className="card bg-gray-50">
      <div className="space-y-2">
        <div className="flex justify-between">
          <h3 className="font-bold">{request.employeeName}</h3>
          <span className="text-sm bg-yellow-200 px-2 py-1 rounded">
            {request.status}
          </span>
        </div>
        <p className="text-sm">
          Date: {format(request.date, 'dd MMM yyyy')}
        </p>
        <p className="text-sm">
          Time: {format(request.loginTime, 'HH:mm')} -{' '}
          {format(request.logoutTime, 'HH:mm')}
        </p>
        <p className="text-sm">Reason: {request.reason}</p>
        {request.status === 'pending' && (
          <div className="flex gap-2 mt-4">
            <Button
              variant="primary"
              onClick={() => onApprove(request.id)}
              className="flex-1 py-2"
            >
              Approve
            </Button>
            <Button
              variant="secondary"
              onClick={() => onReject(request.id)}
              className="flex-1 py-2"
            >
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}