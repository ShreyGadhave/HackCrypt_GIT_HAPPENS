import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { classStudents } from '@/constants/dummyData';

export default function ClassAttendance() {
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Header title="Class Attendance" showBack />
            <ScrollView className="flex-1 px-6 py-4">
                <Text className="text-gray-600 mb-4">
                    Total: {classStudents.length} students
                </Text>

                {classStudents.map((student) => (
                    <Card key={student.id} className="mb-4">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-1">
                                <Text className="text-lg font-bold text-gray-900 mb-1">
                                    {student.name}
                                </Text>
                                <Text className="text-gray-600 text-sm">{student.rollNumber}</Text>
                            </View>
                            <Badge
                                status={student.status as 'verified' | 'failed' | 'suspicious'}
                            />
                        </View>
                    </Card>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}
