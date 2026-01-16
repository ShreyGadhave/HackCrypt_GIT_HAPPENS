import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useState } from 'react';
import Header from '@/components/Header';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { attendanceHistory } from '@/constants/dummyData';

export default function AttendanceHistory() {
    const [selectedMonth, setSelectedMonth] = useState('January');

    const currentMonthData = attendanceHistory.find((m) => m.month === selectedMonth);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Header title="Attendance History" showBack />
            <ScrollView className="flex-1">
                {/* Month Tabs */}
                <View className="bg-white px-6 py-4 border-b border-gray-200">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View className="flex-row gap-3">
                            {attendanceHistory.map((month) => (
                                <TouchableOpacity
                                    key={month.month}
                                    onPress={() => setSelectedMonth(month.month)}
                                    className={`px-6 py-2 rounded-full ${selectedMonth === month.month ? 'bg-blue-600' : 'bg-gray-100'
                                        }`}
                                >
                                    <Text
                                        className={`font-semibold ${selectedMonth === month.month ? 'text-white' : 'text-gray-600'
                                            }`}
                                    >
                                        {month.month}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Subject List */}
                <View className="px-6 py-4">
                    {currentMonthData?.subjects.map((subject, index) => (
                        <Card key={index} className="mb-4">
                            <View className="flex-row justify-between items-start mb-3">
                                <View className="flex-1">
                                    <Text className="text-lg font-bold text-gray-900 mb-1">
                                        {subject.name}
                                    </Text>
                                    <Text className="text-gray-600 text-sm">
                                        {subject.present} / {subject.total} classes
                                    </Text>
                                </View>
                                <Badge
                                    status={subject.percentage >= 75 ? 'present' : 'absent'}
                                    text={`${subject.percentage}%`}
                                />
                            </View>
                            {/* Progress Bar */}
                            <View className="bg-gray-200 h-2 rounded-full overflow-hidden">
                                <View
                                    className={`h-full ${subject.percentage >= 75 ? 'bg-green-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${subject.percentage}%` }}
                                />
                            </View>
                        </Card>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
