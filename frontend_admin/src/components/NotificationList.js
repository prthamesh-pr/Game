import React, { useContext } from 'react';
import { NotificationContext } from './NotificationProvider';
import { ListGroup, Badge } from 'react-bootstrap';

export const NotificationList = () => {
  const { notifications } = useContext(NotificationContext);
  return (
    <ListGroup>
      {notifications.map((n, idx) => (
        <ListGroup.Item key={idx}>
          <Badge bg={n.type === 'error' ? 'danger' : 'info'}>{n.type}</Badge>{' '}
          {n.message}
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
};
