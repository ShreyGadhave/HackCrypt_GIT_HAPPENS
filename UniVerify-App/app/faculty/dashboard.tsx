import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import Card from '@/components/Card';
import { facultyData } from '@/constants/dummyData';

const screenWidth = Dimensions.get('window').width;

export default function FacultyDashboard() {
    const router = useRouter();

    const pieData = [
        {
            name: 'Verified',
            population: facultyData.verified,
            color: '#10b981',
            legendFontColor: '#374151',
            legendFontSize: 14,
        },
        {
            name: 'Failed',
            population: facultyData.failed,
            color: '#ef4444',
            legendFontColor: '#374151',
            legendFontSize: 14,
        },
        {
            name: 'Suspicious',
            population: facultyData.suspicious,
            color: '#f97316',
            legendFontColor: '#374151',
            legendFontSize: 14,
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Header title="Faculty Dashboard" />
            <ScrollView className="flex-1 px-6 py-4">
                {/* Greeting */}
                <Text className="text-2xl font-bold text-gray-900 mb-1">
                    Hello, {facultyData.name}
                </Text>
                <Text className="text-gray-600 mb-6">{facultyData.subject}</Text>

                {/* Stats Cards */}
                <View className="flex-row gap-4 mb-6">
                    <StatCard
                        title="Total Students"
                        value={facultyData.totalStudents}
                        color="blue"
                    />
                    <StatCard
                        title="Present Today"
                        value={facultyData.presentToday}
                        color="green"
                    />
                </View>

                {/* Verification Status Chart */}
                <Card className="mb-6">
                    <Text className="text-lg font-bold text-gray-900 mb-4">
                        Today's Verification Status
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

                {/* Stats Summary */}
                <Card className="mb-6">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Summary</Text>
                    <View className="gap-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Verified</Text>
                            <Text className="font-semibold text-green-600">
                                {facultyData.verified} students
                            </Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Failed</Text>
                            <Text className="font-semibold text-red-600">
                                {facultyData.failed} students
                            </Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Suspicious</Text>
                            <Text className="font-semibold text-orange-600">
                                {facultyData.suspicious} students
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* View Class Attendance Button */}
                <TouchableOpacity
                    onPress={() => router.push('/faculty/class-attendance')}
                    className="bg-blue-600 py-4 rounded-xl mb-6"
                >
                    <Text className="text-white text-center font-bold text-lg">
                        View Class Attendance
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
