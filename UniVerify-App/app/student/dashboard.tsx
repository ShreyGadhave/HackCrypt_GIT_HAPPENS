import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import Header from '@/components/Header';
import Card from '@/components/Card';
import { studentData, weeklyAttendance, todayClass } from '@/constants/dummyData';

const screenWidth = Dimensions.get('window').width;

export default function StudentDashboard() {
    const router = useRouter();

    const pieData = [
        {
            name: 'Present',
            population: studentData.attended,
            color: '#10b981',
            legendFontColor: '#374151',
            legendFontSize: 14,
        },
        {
            name: 'Absent',
            population: studentData.absent,
            color: '#ef4444',
            legendFontColor: '#374151',
            legendFontSize: 14,
        },
    ];

    const barData = {
        labels: weeklyAttendance.map((d) => d.day),
        datasets: [
            {
                data: weeklyAttendance.map((d) => d.present),
            },
        ],
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Header title="Dashboard" />
            <ScrollView className="flex-1 px-6 py-4">
                {/* Greeting */}
                <Text className="text-2xl font-bold text-gray-900 mb-1">
                    Hello, {studentData.name}
                </Text>
                <Text className="text-gray-600 mb-6">Roll No: {studentData.rollNumber}</Text>

                {/* Attendance Percentage Card */}
                <Card className="mb-6">
                    <Text className="text-gray-600 mb-2">Overall Attendance</Text>
                    <Text className="text-5xl font-bold text-blue-600 mb-1">
                        {studentData.attendancePercentage}%
                    </Text>
                    <Text className="text-gray-500 text-sm">
                        {studentData.attended} / {studentData.totalClasses} classes attended
                    </Text>
                </Card>

                {/* Pie Chart */}
                <Card className="mb-6">
                    <Text className="text-lg font-bold text-gray-900 mb-4">
                        Attendance Distribution
                    </Text>
                    <PieChart
                        data={pieData}
                        width={screenWidth - 80}
                        height={200}
                        chartConfig={{
                            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        }}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                    />
                </Card>

                {/* Weekly Bar Chart */}
                <Card className="mb-6">
                    <Text className="text-lg font-bold text-gray-900 mb-4">
                        This Week's Attendance
                    </Text>
                    <BarChart
                        data={barData}
                        width={screenWidth - 80}
                        height={200}
                        yAxisLabel=""
                        yAxisSuffix=""
                        chartConfig={{
                            backgroundColor: '#ffffff',
                            backgroundGradientFrom: '#ffffff',
                            backgroundGradientTo: '#ffffff',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
                            style: {
                                borderRadius: 16,
                            },
                        }}
                        style={{
                            borderRadius: 16,
                        }}
                    />
                </Card>

                {/* Today's Class */}
                <Card className="mb-6">
                    <Text className="text-lg font-bold text-gray-900 mb-3">Today's Class</Text>
                    <View className="gap-2">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Subject</Text>
                            <Text className="font-semibold text-gray-900">{todayClass.subject}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Time</Text>
                            <Text className="font-semibold text-gray-900">{todayClass.time}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Room</Text>
                            <Text className="font-semibold text-gray-900">{todayClass.room}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Faculty</Text>
                            <Text className="font-semibold text-gray-900">{todayClass.faculty}</Text>
                        </View>
                    </View>
                </Card>

                {/* Mark Attendance Button */}
                <TouchableOpacity
                    onPress={() => router.push('/student/mark-attendance')}
                    className="bg-blue-600 py-4 rounded-xl mb-4"
                >
                    <Text className="text-white text-center font-bold text-lg">
                        Mark Attendance
                    </Text>
                </TouchableOpacity>

                {/* View History Button */}
                <TouchableOpacity
                    onPress={() => router.push('/student/history')}
                    className="bg-white border border-gray-300 py-4 rounded-xl mb-6"
                >
                    <Text className="text-gray-700 text-center font-bold text-lg">
                        View History
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
