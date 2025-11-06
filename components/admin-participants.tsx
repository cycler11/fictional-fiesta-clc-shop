"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserPlus, Key, Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Participant = {
  id: number
  name: string
  email: string
  status: string
  role: string
  balance: number
  access_code?: string
}

type AccessCode = {
  id: number
  code: string
  participant_id: number | null
  participant_name: string | null
  role: string
  is_used: number
  expires_at: string
  created_at: string
}

export function AdminParticipants({
  participants,
  accessCodes,
}: {
  participants: Participant[]
  accessCodes: AccessCode[]
}) {
  const [isAddingParticipant, setIsAddingParticipant] = useState(false)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const { toast } = useToast()

  const [newParticipant, setNewParticipant] = useState({
    name: "",
    email: "",
    role: "participant" as "participant" | "operator",
    initialPoints: 0,
  })

  const [newCode, setNewCode] = useState({
    participantId: "0", // Updated default value to '0'
    role: "participant" as "participant" | "operator",
    expiresInDays: 30,
  })

  const handleAddParticipant = async () => {
    setIsAddingParticipant(true)
    try {
      const res = await fetch("/api/admin/participants/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newParticipant),
      })

      if (!res.ok) throw new Error("Failed to create participant")

      const data = await res.json()
      toast({
        title: "Участник создан",
        description: `Код доступа: ${data.accessCode}`,
      })

      setNewParticipant({ name: "", email: "", role: "participant", initialPoints: 0 })
      window.location.reload()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать участника",
        variant: "destructive",
      })
    } finally {
      setIsAddingParticipant(false)
    }
  }

  const handleGenerateCode = async () => {
    setIsGeneratingCode(true)
    try {
      const res = await fetch("/api/admin/access-codes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCode),
      })

      if (!res.ok) throw new Error("Failed to generate code")

      const data = await res.json()
      toast({
        title: "Код создан",
        description: `Новый код доступа: ${data.code}`,
      })

      setNewCode({ participantId: "0", role: "participant", expiresInDays: 30 }) // Updated default value to '0'
      window.location.reload()
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать код",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
    toast({
      title: "Скопировано",
      description: `Код ${code} скопирован в буфер обмена`,
    })
  }

  return (
    <div className="space-y-6">
      {/* Participants Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Участники</CardTitle>
              <CardDescription>Управление участниками клуба</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Добавить участника
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Новый участник</DialogTitle>
                  <DialogDescription>
                    Создайте нового участника. Код доступа будет сгенерирован автоматически.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Имя</Label>
                    <Input
                      id="name"
                      value={newParticipant.name}
                      onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                      placeholder="Иван Иванов"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newParticipant.email}
                      onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                      placeholder="ivan@caltech.edu"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Роль</Label>
                    <Select
                      value={newParticipant.role}
                      onValueChange={(value: "participant" | "operator") =>
                        setNewParticipant({ ...newParticipant, role: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="participant">Участник</SelectItem>
                        <SelectItem value="operator">Оператор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points">Начальные баллы</Label>
                    <Input
                      id="points"
                      type="number"
                      value={newParticipant.initialPoints}
                      onChange={(e) =>
                        setNewParticipant({ ...newParticipant, initialPoints: Number.parseInt(e.target.value) || 0 })
                      }
                      placeholder="0"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddParticipant} disabled={isAddingParticipant}>
                    {isAddingParticipant ? "Создание..." : "Создать"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Баланс</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Код доступа</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell className="font-medium">{participant.name}</TableCell>
                  <TableCell>{participant.email}</TableCell>
                  <TableCell>
                    <Badge variant={participant.role === "operator" ? "default" : "secondary"}>
                      {participant.role === "operator" ? "Оператор" : "Участник"}
                    </Badge>
                  </TableCell>
                  <TableCell>{participant.balance} баллов</TableCell>
                  <TableCell>
                    <Badge variant={participant.status === "active" ? "default" : "secondary"}>
                      {participant.status === "active" ? "Активен" : "Неактивен"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {participant.access_code && (
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(participant.access_code!)}>
                        {copiedCode === participant.access_code ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Access Codes Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Коды доступа</CardTitle>
              <CardDescription>Управление кодами для входа в систему</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Key className="mr-2 h-4 w-4" />
                  Создать код
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Новый код доступа</DialogTitle>
                  <DialogDescription>
                    Создайте новый код для существующего участника или гостевой код.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="participant">Участник (опционально)</Label>
                    <Select
                      value={newCode.participantId}
                      onValueChange={(value) => setNewCode({ ...newCode, participantId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Гостевой код" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Гостевой код</SelectItem> {/* Updated value prop to '0' */}
                        {participants.map((p) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.name} ({p.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code-role">Роль</Label>
                    <Select
                      value={newCode.role}
                      onValueChange={(value: "participant" | "operator") => setNewCode({ ...newCode, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="participant">Участник</SelectItem>
                        <SelectItem value="operator">Оператор</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expires">Срок действия (дней)</Label>
                    <Input
                      id="expires"
                      type="number"
                      value={newCode.expiresInDays}
                      onChange={(e) => setNewCode({ ...newCode, expiresInDays: Number.parseInt(e.target.value) || 30 })}
                      placeholder="30"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleGenerateCode} disabled={isGeneratingCode}>
                    {isGeneratingCode ? "Создание..." : "Создать код"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Код</TableHead>
                <TableHead>Участник</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Истекает</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessCodes.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="font-mono font-semibold">{code.code}</TableCell>
                  <TableCell>{code.participant_name || "Гостевой"}</TableCell>
                  <TableCell>
                    <Badge variant={code.role === "operator" ? "default" : "secondary"}>
                      {code.role === "operator" ? "Оператор" : "Участник"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={code.is_used ? "secondary" : "default"}>
                      {code.is_used ? "Использован" : "Активен"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(code.expires_at).toLocaleDateString("ru-RU")}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(code.code)}>
                      {copiedCode === code.code ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
