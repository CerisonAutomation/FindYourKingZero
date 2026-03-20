import {AnimatePresence, motion} from 'framer-motion';
import {Bell, Calendar, Check, CheckCheck, Crown, Eye, Heart, MessageSquare, Trash2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from '@/components/ui/sheet';
import {Notification, useNotifications} from '@/hooks/useNotifications';
import {formatDistanceToNow} from 'date-fns';
import {cn} from '@/lib/utils';

export const NotificationsPanel = () => {
    const {notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification} = useNotifications();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5"/>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{scale: 0}}
                            animate={{scale: 1}}
                            className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md p-0">
                <SheetHeader className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5"/>
                            Notifications
                        </SheetTitle>
                        {unreadCount > 0 && (
                            <Button variant="ghost" size="sm" onClick={() => markAllAsRead()} className="gap-1">
                                <CheckCheck className="h-4 w-4"/>
                                Mark all read
                            </Button>
                        )}
                    </div>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-80px)]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Bell className="h-12 w-12 mb-4 opacity-50"/>
                            <p>No notifications yet</p>
                            <p className="text-sm">We'll notify you when something happens!</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            <AnimatePresence>
                                {notifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        onMarkAsRead={() => markAsRead(notification.id)}
                                        onDelete={() => deleteNotification(notification.id)}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};

const NotificationItem = ({
                              notification,
                              onMarkAsRead,
                              onDelete,
                          }: {
    notification: Notification;
    onMarkAsRead: () => void;
    onDelete: () => void;
}) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'match':
                return <Crown className="h-5 w-5 text-yellow-500"/>;
            case 'like':
                return <Heart className="h-5 w-5 text-red-500"/>;
            case 'message':
                return <MessageSquare className="h-5 w-5 text-blue-500"/>;
            case 'booking':
                return <Calendar className="h-5 w-5 text-green-500"/>;
            case 'view':
                return <Eye className="h-5 w-5 text-purple-500"/>;
            default:
                return <Bell className="h-5 w-5 text-muted-foreground"/>;
        }
    };

    return (
        <motion.div
            initial={{opacity: 0, x: -20}}
            animate={{opacity: 1, x: 0}}
            exit={{opacity: 0, x: 20}}
            className={cn(
                'p-4 hover:bg-muted/50 transition-colors group',
                !notification.is_read && 'bg-primary/5'
            )}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    {getIcon()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className={cn('font-medium', !notification.is_read && 'text-primary')}>
                                {notification.title}
                            </p>
                            {notification.body && (
                                <p className="text-sm text-muted-foreground line-clamp-2">{notification.body}</p>
                            )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.is_read && (
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMarkAsRead}>
                                    <Check className="h-4 w-4"/>
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete}>
                                <Trash2 className="h-4 w-4"/>
                            </Button>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {addSuffix: true})}
                    </p>
                </div>
                {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"/>
                )}
            </div>
        </motion.div>
    );
};
