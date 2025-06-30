import { Stack, Typography } from "@mui/material"
import CminiController from "@backend/cmini/controller"

export const dynamicParams = false

export async function generateStaticParams() {
    const ids = CminiController.getAuthorIds()
    const props = ids.map(id => ({ id }))
    return props
}

export default async function Page({ params }: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const layouts = CminiController.getBoardLayoutsByAuthorId(id)
    const name = CminiController.getAuthorName(id)
    return (
        <Stack>
            <Typography variant="h3">{name}</Typography>
            {layouts.map(({ layout, boardLayout, meta }) => (
                <Stack key={boardLayout.boardHash}>
                    <Typography>{layout.layoutHash}</Typography>

                    <Stack >
                        <Typography>{meta.name}</Typography>
                        <Typography>{meta.likes}</Typography>
                        <Typography>{boardLayout.boardHash}</Typography>
                    </Stack>
                </Stack>
            ))}
        </Stack>
    )
}