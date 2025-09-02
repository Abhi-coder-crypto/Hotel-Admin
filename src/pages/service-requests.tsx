import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Bell, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { ServiceRequest } from "@shared/types";
import ServiceRequestCard from "@/components/service-request-card";

export default function ServiceRequests() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: serviceRequests = [], isLoading } = useQuery<ServiceRequest[]>({
    queryKey: ["/api/service-requests"],
  });

  const filteredRequests = serviceRequests.filter(request =>
    (request.description ? request.description.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (request.roomNumber ? request.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
    (request.type ? request.type.toLowerCase().includes(searchTerm.toLowerCase()) : false)
  );

  const pendingRequests = filteredRequests.filter(req => req.status === "pending");
  const assignedRequests = filteredRequests.filter(req => req.status === "assigned");
  const inProgressRequests = filteredRequests.filter(req => req.status === "in_progress");
  const completedRequests = filteredRequests.filter(req => req.status === "completed");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <AlertCircle className="w-4 h-4" />;
      case "assigned":
        return <Clock className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-white to-orange-50/50 shadow-sm border-b border-gray-100 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Service Requests</h2>
            <p className="text-sm text-gray-600 mt-1">Manage and track all guest service requests</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm" data-testid="badge-total-requests">
              Total: {serviceRequests.length}
            </Badge>
            <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm" data-testid="badge-pending-requests">
              Pending: {pendingRequests.length}
            </Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50/30 to-orange-50/20">
        {/* Search */}
        <Card className="mb-8 border-0 shadow-lg bg-gradient-to-r from-white to-gray-50/50">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by description, room number, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-requests"
              />
            </div>
          </CardContent>
        </Card>

        {/* Status Tabs */}
        <Tabs defaultValue="pending" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg border-0 h-14">
            <TabsTrigger value="pending" className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
              {getStatusIcon("pending")}
              <span>Pending</span>
              <Badge className="bg-yellow-100 text-yellow-800 shadow-sm">
                {pendingRequests.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="assigned" className="flex items-center space-x-2">
              {getStatusIcon("assigned")}
              <span>Assigned</span>
              <Badge variant="secondary" className={getStatusColor("assigned")}>
                {assignedRequests.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="flex items-center space-x-2">
              {getStatusIcon("in_progress")}
              <span>In Progress</span>
              <Badge variant="secondary" className={getStatusColor("in_progress")}>
                {inProgressRequests.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center space-x-2">
              {getStatusIcon("completed")}
              <span>Completed</span>
              <Badge variant="secondary" className={getStatusColor("completed")}>
                {completedRequests.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-yellow-50/30">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-3 text-xl font-semibold text-gray-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                  <span>Pending Requests</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">Loading service requests...</div>
                ) : pendingRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No pending requests
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <ServiceRequestCard key={request.id} request={request} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assigned">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Assigned Requests</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {assignedRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No assigned requests
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignedRequests.map((request) => (
                      <ServiceRequestCard key={request.id} request={request} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="in_progress">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span>In Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {inProgressRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No requests in progress
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inProgressRequests.map((request) => (
                      <ServiceRequestCard key={request.id} request={request} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Completed Requests</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {completedRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No completed requests
                  </div>
                ) : (
                  <div className="space-y-4">
                    {completedRequests.map((request) => (
                      <ServiceRequestCard key={request.id} request={request} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
